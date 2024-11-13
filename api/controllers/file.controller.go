package controllers

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"sync"
	"time"

	"octopush/internal/config"
	"octopush/internal/models"

	"octopush/internal/database"
	"octopush/internal/utils"

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
		c.JSON(
			http.StatusBadRequest,
			gin.H{"error": err.Error()})
		return
	}

	shortLink := utils.GenerateShortLink(shortLinkLen)
	filename := filepath.Join(uploadDir, file.Filename)

	resultChan := make(chan error, 1)

	go func() {
		err := c.SaveUploadedFile(file, filename)
		if err != nil {
			resultChan <- err
			return
		}

		fileRecord := models.File{
			ShortLink:   shortLink,
			Filename:    file.Filename,
			TimeUpdated: time.Now(),
		}

		err = db.Create(&fileRecord).Error

		if err != nil {
			resultChan <- err
		}
	}()

	c.JSON(http.StatusAccepted, gin.H{
		"message": "File upload in progress",
		"url":     shortLink,
	})

	go func() {
		result := <-resultChan

		log.Printf("Error processing upload for %s: %v", shortLink, result)
		cleanupUpload(shortLink, file.Filename)
	}()
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
		filePath = filepath.Join(uploadDir, file.Filename)
		_, err := os.Stat(filePath)
		fileExists = !os.IsNotExist(err)
	}()

	done := make(chan struct{})
	go func() {
		wg.Wait()
		close(done)
	}()

	select {
	case <-done:
	case <-time.After(5 * time.Second): // wait time for serving item
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
