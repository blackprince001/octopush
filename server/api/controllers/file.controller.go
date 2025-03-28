package controllers

import (
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"sync"
	"time"

	"octopush/server/config"
	"octopush/server/models"

	"octopush/server/database"
	"octopush/server/utils"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

var (
	uploadDir    = config.ENV.StoragePath
	shortLinkLen = config.ENV.StringLength
	timeout      = config.ENV.DownloadTimeout
)

var db *gorm.DB = database.GetDatabaseConnection()

func UploadHandler(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	shortLink := utils.GenerateShortLink(shortLinkLen)
	filename := filepath.Join(uploadDir, file.Filename)

	newFile := &models.File{
		ShortLink:   shortLink,
		Filename:    file.Filename,
		TimeUpdated: time.Now(),
	}

	err = db.Create(newFile).Error
	if err != nil {
		cleanupUpload(shortLink, file.Filename)

		if isDuplicateKeyError(err) {
			c.JSON(http.StatusConflict, gin.H{
				"error": "File with this name already exists",
			})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Database error: " + err.Error(),
		})
		return
	}

	if err := c.SaveUploadedFile(file, filename); err != nil {
		c.JSON(http.StatusInternalServerError,
			gin.H{
				"error": "Failed to save file: " + err.Error(),
			},
		)
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "File uploaded successfully",
		"url":     shortLink,
	})
}

func isDuplicateKeyError(err error) bool {
	if err == nil {
		return false
	}

	return strings.Contains(err.Error(), "unique constraint") ||
		strings.Contains(err.Error(), "Duplicate entry") ||
		strings.Contains(err.Error(), "UNIQUE constraint failed")
}

func cleanupUpload(shortLink, filename string) {
	var wg sync.WaitGroup
	wg.Add(2)

	go func() {
		defer wg.Done()
		filePath := filepath.Join(uploadDir, filename)
		if err := os.Remove(filePath); err != nil {
			log.Printf("Error deleting file %s: %v", filePath, err)
		}
	}()

	go func() {
		defer wg.Done()
		if err := db.Where(
			"short_link = ?", shortLink).Delete(
			&models.File{}).Error; err != nil {
			log.Printf("Error deleting database record for %s: %v", shortLink, err)
		}
	}()

	wg.Wait()
	log.Printf("Cleanup completed for %s", shortLink)
}

func sanitizeFilename(filename string) (string, error) {
	if strings.Contains(filename, "..") || strings.HasPrefix(filename, "/") {
		return "", fmt.Errorf("invalid filename")
	}
	return filename, nil
}

func DownloadHandler(c *gin.Context) {
	shortLink := c.Param("shortLink")

	var wg sync.WaitGroup
	wg.Add(2)

	var file models.File
	var dbErr error
	var fileExists bool
	var filePath string

	go func() {
		defer wg.Done()
		if err := db.Where(
			"short_link = ?", shortLink).First(
			&file).Error; err != nil {
			dbErr = err
		}
	}()

	go func() {
		defer wg.Done()
		sanitizedFilename, err := sanitizeFilename(file.Filename)
		if err != nil {
			fileExists = false
			return
		}

		filePath = filepath.Join(uploadDir, sanitizedFilename)
		_, err = os.Stat(filePath)
		fileExists = !os.IsNotExist(err)
	}()

	done := make(chan struct{})
	go func() {
		wg.Wait()
		close(done)
	}()

	select {
	case <-done:
	case <-time.After(timeout):
		c.JSON(
			http.StatusInternalServerError,
			gin.H{"error": "Operation timed out"})
		return
	}

	if dbErr != nil {
		if dbErr == gorm.ErrRecordNotFound {
			c.JSON(
				http.StatusNotFound,
				gin.H{"error": "File record not found in database"})
		} else {
			c.JSON(
				http.StatusInternalServerError,
				gin.H{"error": "Database error: " + dbErr.Error()})
		}
		return
	}

	if !fileExists {
		c.JSON(
			http.StatusNotFound,
			gin.H{"error": "File not found on server"})
		return
	}

	c.Header(
		"Content-Disposition",
		fmt.Sprintf("attachment; filename=%s", file.Filename))
	c.File(filePath)
}

func GetSavedUploadsInformation(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	var files []models.File
	var total int64

	offset := (page - 1) * pageSize

	if err := db.Model(&models.File{}).Count(&total).Error; err != nil {
		c.JSON(
			http.StatusNotFound,
			gin.H{"error": "Error Processing Files"})
		return
	}

	if err := db.Offset(offset).Limit(pageSize).Order("time_updated DESC").Find(&files).Error; err != nil {
		c.JSON(
			http.StatusNotFound,
			gin.H{"error": "No Files not found on server"})
		return
	}

	c.JSON(
		http.StatusOK,
		gin.H{
			"files": files,
			"meta": gin.H{
				"total":     total,
				"page":      page,
				"page_size": pageSize,
			},
		},
	)
}

func GetSingleFileInformation(c *gin.Context) {
	shortLink := c.Param("shortLink")

	var wg sync.WaitGroup
	wg.Add(2)

	var file models.File
	var dbErr error
	var fileExists bool
	var filePath string

	go func() {
		defer wg.Done()
		if err := db.Where(
			"short_link = ?", shortLink).First(
			&file).Error; err != nil {
			dbErr = err
		}
	}()

	go func() {
		defer wg.Done()
		sanitizedFilename, err := sanitizeFilename(file.Filename)
		if err != nil {
			fileExists = false
			return
		}

		filePath = filepath.Join(uploadDir, sanitizedFilename)
		_, err = os.Stat(filePath)
		fileExists = !os.IsNotExist(err)
	}()

	done := make(chan struct{})
	go func() {
		wg.Wait()
		close(done)
	}()

	select {
	case <-done:
	case <-time.After(timeout):
		c.JSON(
			http.StatusInternalServerError,
			gin.H{"error": "Operation timed out"})
		return
	}

	if dbErr != nil {
		if dbErr == gorm.ErrRecordNotFound {
			c.JSON(
				http.StatusNotFound,
				gin.H{"error": "File record not found in database"})
		} else {
			c.JSON(
				http.StatusInternalServerError,
				gin.H{"error": "Database error: " + dbErr.Error()})
		}
		return
	}

	if !fileExists {
		c.JSON(
			http.StatusNotFound,
			gin.H{"error": "File not found on server"})
		return
	}

	c.JSON(
		http.StatusOK,
		gin.H{
			"file": file,
		},
	)
}

func DeleteFile(c *gin.Context) {
	shortLink := c.Param("shortLink")

	var file models.File
	if err := db.Where("short_link = ?", shortLink).First(&file).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "File not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error: " + err.Error()})
		return
	}

	sanitizedFilename, err := sanitizeFilename(file.Filename)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid filename"})
		return
	}

	var deleteErrors []string
	filePath := filepath.Join(uploadDir, sanitizedFilename)

	if err := os.Remove(filePath); err != nil {
		if !os.IsNotExist(err) {
			deleteErrors = append(deleteErrors, "File deletion error: "+err.Error())
		}
	}

	if err := db.Delete(&file).Error; err != nil {
		deleteErrors = append(deleteErrors, "Database deletion error: "+err.Error())
	}

	if len(deleteErrors) > 0 {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Partial deletion occurred",
			"details": deleteErrors,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "File and record deleted successfully",
		"deleted": gin.H{
			"short_link": shortLink,
			"filename":   file.Filename,
		},
	})
}
