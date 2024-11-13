package main

import (
	"fmt"
	"log"
	"octopush/internal/config"
	"octopush/internal/database"

	"octopush/api/routes"
	"octopush/internal/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

var db *gorm.DB = database.GetDatabaseConnection()

func main() {
	err := db.AutoMigrate(&models.File{})
	if err != nil {
		log.Fatal(err)
	}

	r := gin.Default()

	v1 := r.Group("")
	{
		routes.RegisterFileRoutes(v1)
	}

	r.Run(fmt.Sprintf(":%s", config.ENV.ServerPort))
}
