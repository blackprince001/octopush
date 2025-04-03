package utils

import (
	"fmt"
	"strings"
)

func IsDuplicateKeyError(err error) bool {
	if err == nil {
		return false
	}

	return strings.Contains(err.Error(), "unique constraint") ||
		strings.Contains(err.Error(), "Duplicate entry") ||
		strings.Contains(err.Error(), "UNIQUE constraint failed")
}

func SanitizeFilename(filename string) (string, error) {
	if strings.Contains(filename, "..") || strings.HasPrefix(filename, "/") {
		return "", fmt.Errorf("invalid filename")
	}
	return filename, nil
}
