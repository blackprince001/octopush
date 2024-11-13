package models

import "time"

type File struct {
	ShortLink   string `gorm:"primaryKey"`
	Filename    string `gorm:"not null"`
	TimeUpdated time.Time
}
