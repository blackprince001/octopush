package controllers

import (
	"archive/zip"
	"errors"
	"fmt"
	"io"
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

		if utils.IsDuplicateKeyError(err) {
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

func UploadFolderHandler(c *gin.Context) {
	groupName := c.Param("groupName")
	form, err := c.MultipartForm()
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	files := form.File["files"]
	errs := make([]string, len(files))

	for _, file := range files {
		shortLink := utils.GenerateShortLink(shortLinkLen)
		filename := filepath.Join(uploadDir, file.Filename)

		newFile := &models.File{
			ShortLink:   shortLink,
			Filename:    file.Filename,
			GroupName:   groupName,
			TimeUpdated: time.Now(),
		}

		err = db.Create(newFile).Error
		if err != nil {
			cleanupUpload(shortLink, file.Filename)

			if utils.IsDuplicateKeyError(err) {
				errs = append(errs, fmt.Sprintf("File already exist in the stored location: %s", file.Filename))
				continue
			}

			errs = append(errs, fmt.Sprintf("Database could not create file %s with error %s", file.Filename, err.Error()))
			continue
		}

		if err := c.SaveUploadedFile(file, filename); err != nil {
			errs = append(errs, fmt.Sprintf("Could not save file on server %s with error %s", file.Filename, err.Error()))
			continue
		}
	}

	if len(errs) == 0 {
		c.JSON(http.StatusCreated, gin.H{
			"message":              "Files uploaded successfully",
			"files_uploaded_count": len(files),
			"group_name":           groupName,
		})
	} else {

		log.Printf("Error uploading some files. All errors related %v", errs)

		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Failed to upload Files. These were the errors present.",
			"errors":  errs,
		})
	}
}

func DownloadHandler(c *gin.Context) {
	shortLink := c.Param("shortLink")

	var file models.File
	var dbErr error
	var fileExists bool
	var filePath string

	if err := db.Where(
		"short_link = ?", shortLink).First(
		&file).Error; err != nil {
		dbErr = err
	}

	sanitizedFilename, err := utils.SanitizeFilename(file.Filename)
	if err != nil {
		fileExists = false
	}

	filePath = filepath.Join(uploadDir, sanitizedFilename)
	_, err = os.Stat(filePath)
	fileExists = !os.IsNotExist(err)

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

func DownloadGroupHandler(c *gin.Context) {
	groupName := c.Param("groupName")

	var files []models.File
	if err := db.Where("group_name = ?", groupName).Find(&files).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error: " + err.Error()})
		return
	}

	if len(files) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "No files found for group " + groupName})
		return
	}

	zipWriter := zip.NewWriter(c.Writer)
	defer zipWriter.Close()

	c.Header("Content-Type", "application/zip")
	c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=%s.zip", groupName))

	var errs []string

	for _, file := range files {
		sanitized, err := utils.SanitizeFilename(file.Filename)
		if err != nil {
			errs = append(errs, fmt.Sprintf("%s: invalid filename", file.Filename))
			continue
		}

		filePath := filepath.Join(uploadDir, sanitized)
		if _, err := os.Stat(filePath); err != nil {
			errs = append(errs, fmt.Sprintf("%s: file not found", file.Filename))
			continue
		}

		data, err := os.Open(filePath)
		if err != nil {
			errs = append(errs, fmt.Sprintf("%s: read error", file.Filename))
			continue
		}
		defer data.Close()

		header := &zip.FileHeader{
			Name:     file.Filename,
			Method:   zip.Deflate,
			Modified: time.Now(),
		}

		fw, err := zipWriter.CreateHeader(header)
		if err != nil {
			errs = append(errs, fmt.Sprintf("%s: zip creation failed", file.Filename))
			continue
		}

		if _, err := io.Copy(fw, data); err != nil {
			errs = append(errs, fmt.Sprintf("%s: copy failed", file.Filename))
		}
	}

	if len(errs) > 0 {
		c.Header("X-Errors", strings.Join(errs, "|"))
	}
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

	var file models.File
	var dbErr error
	var fileExists bool
	var filePath string

	if err := db.Where(
		"short_link = ?", shortLink).First(
		&file).Error; err != nil {
		dbErr = err
	}

	sanitizedFilename, err := utils.SanitizeFilename(file.Filename)
	if err != nil {
		fileExists = false
	}

	filePath = filepath.Join(uploadDir, sanitizedFilename)
	_, err = os.Stat(filePath)
	fileExists = !os.IsNotExist(err)

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

	sanitizedFilename, err := utils.SanitizeFilename(file.Filename)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid filename"})
		return
	}

	var errs []string
	filePath := filepath.Join(uploadDir, sanitizedFilename)

	if err := os.Remove(filePath); err != nil {
		if !os.IsNotExist(err) {
			errs = append(errs, "File deletion error: "+err.Error())
		}
	}

	if err := db.Delete(&file).Error; err != nil {
		errs = append(errs, "Database deletion error: "+err.Error())
	}

	if len(errs) > 0 {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Partial deletion occurred",
			"details": errs,
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
