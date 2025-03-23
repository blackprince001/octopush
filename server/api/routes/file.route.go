package routes

import (
	"octopush/server/api/controllers"

	"github.com/gin-gonic/gin"
)

func RegisterFileRoutes(r *gin.RouterGroup) {
	fileRoutes := r.Group("/files")

	fileRoutes.POST("/upload", controllers.UploadHandler)
	fileRoutes.GET("/download/:shortLink", controllers.DownloadHandler)
	fileRoutes.GET("/", controllers.GetSavedUploadsInformation)
	fileRoutes.GET("/item/:shortLink", controllers.GetSingleFileInformation)
}
