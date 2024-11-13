package utils

import "math/rand"

func GenerateShortLink(linkLen int) string {
	const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	shortLink := make([]byte, linkLen)

	for i := range shortLink {
		shortLink[i] = charset[rand.Intn(len(charset))]
	}
	
	return string(shortLink)
}
