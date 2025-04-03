package routes

import (
	"octopush/server/api/controllers"

	"github.com/gin-gonic/gin"
)

func RegisterFileRoutes(r *gin.RouterGroup) {
	fileRoutes := r.Group("/files")

	fileRoutes.POST("/upload", controllers.UploadHandler)
	fileRoutes.POST("/upload/:groupName", controllers.UploadFolderHandler)
	fileRoutes.GET("/download/item/:shortLink", controllers.DownloadHandler)
	fileRoutes.GET("/download/group/:groupName", controllers.DownloadGroupHandler)
	fileRoutes.GET("/", controllers.GetSavedUploadsInformation)
	fileRoutes.GET("/item/:shortLink", controllers.GetSingleFileInformation)
	fileRoutes.DELETE("/item/:shortLink", controllers.DeleteFile)
}
