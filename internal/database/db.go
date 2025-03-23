package database

import (
	"log"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func GetDatabaseConnection() *gorm.DB {
	db, err := gorm.Open(sqlite.Open("./db/test.db"), &gorm.Config{})
	if err != nil {
		panic("failed to connect database")
	}

	log.Println("Connected to Database")
	return db
}
