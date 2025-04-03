package config

import (
	"log"
	"os"
	"strconv"
)

type Config struct {
	ServerPort      string
	StringLength    int
	StoragePath     string

}

var ENV = initConfig()

func initConfig() Config {
	stringLenVal, err := strconv.Atoi(getEnv("SHORT_LEN", "6"))
	if err != nil {
		log.Fatal("Error occurred when parsing string_length value")
	}

	return Config{
		ServerPort:      getEnv("SERVER_PORT", "5678"),
		StringLength:    stringLenVal,
		StoragePath:     getEnv("STORAGE_PATH", "./uploads"),

	}
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}
