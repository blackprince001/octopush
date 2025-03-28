package main

import (
	"fmt"
	"log"

	"octopush/server/config"
	"octopush/server/database"

	"octopush/server/api/routes"
	"octopush/server/models"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

var db *gorm.DB = database.GetDatabaseConnection()

func main() {
	err := db.AutoMigrate(&models.File{})
	if err != nil {
		log.Fatal(err)
	}

	db.Migrator().CreateIndex(&models.File{}, "ShortLink")
	db.Migrator().CreateIndex(&models.File{}, "Filename")

	r := gin.Default()
	r.Use(cors.Default())

	v1 := r.Group("")
	{
		routes.RegisterFileRoutes(v1)
	}

	r.Run(fmt.Sprintf(":%s", config.ENV.ServerPort))
}
