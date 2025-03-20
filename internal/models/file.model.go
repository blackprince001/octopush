package models

import "time"

type File struct {
	ShortLink   string    `gorm:"primaryKey" json:"short_link"`
	Filename    string    `gorm:"not null" json:"file_name"`
	TimeUpdated time.Time `json:"time_updated"`
}
