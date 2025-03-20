package config

import (
	"log"
	"os"
	"strconv"
	"time"

	"github.com/joho/godotenv"
)

type Config struct {
	ServerPort      string
	StringLength    int
	StoragePath     string
	DownloadTimeout time.Duration
}

var ENV = initConfig()

func initConfig() Config {
	if err := godotenv.Load(); err != nil {
		log.Fatal("Failed to load env variables")
	}

	stringLenVal, err := strconv.Atoi(getEnv("SHORT_LEN", "6"))
	if err != nil {
		log.Fatal("Error occurred when parsing string_length value")
	}

	downloadTimeout, err := strconv.Atoi(getEnv("DOWNLOAD_TIMEOUT", "2"))
	if err != nil {
		log.Fatal("Error occurred when parsing download timeout value")
	}

	timeout := time.Duration(downloadTimeout) * time.Second

	return Config{
		ServerPort:      getEnv("SERVER_PORT", "5678"),
		StringLength:    stringLenVal,
		StoragePath:     getEnv("STORAGE_PATH", "./uploads"),
		DownloadTimeout: timeout,
	}
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}
