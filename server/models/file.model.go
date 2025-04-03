package models

import "time"

type File struct {
	ShortLink   string    `gorm:"primaryKey" json:"short_link"`
	Filename    string    `gorm:"not null;unique" json:"file_name"`
	GroupName   string    `gorm:"not null;default:ungrouped" json:"group_name"`
	TimeUpdated time.Time `json:"time_updated"`
}
