package routes

import (
	"octopush/api/controllers"

	"github.com/gin-gonic/gin"
)

func RegisterFileRoutes(r *gin.RouterGroup) {
	fileRoutes := r.Group("/files")

	fileRoutes.POST("/upload", controllers.UploadHandler)
	fileRoutes.GET("/download/:shortLink", controllers.DownloadHandler)
	fileRoutes.GET("/", controllers.GetSavedUploadsInformation)
}
