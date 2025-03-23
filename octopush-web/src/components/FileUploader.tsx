"use client"

import { useState, useRef, type DragEvent, type ChangeEvent } from "react"
import { Upload, X } from "lucide-react"
import { Button } from "./ui/button"
import { Progress } from "./ui/progress"
import { uploadFile } from "../services/api"
import toast from "react-hot-toast"

interface FileUploaderProps {
  onUploadSuccess?: (shortLink: string) => void
}

export default function FileUploader({ onUploadSuccess }: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setIsUploading(true)
    setProgress(0)

    try {
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + Math.random() * 10
          return newProgress > 90 ? 90 : newProgress
        })
      }, 300)

      const response = await uploadFile(file)

      clearInterval(progressInterval)
      setProgress(100)

      toast.success("File uploaded successfully!")

      if (onUploadSuccess) {
        onUploadSuccess(response.url)
      }

      setTimeout(() => {
        setFile(null)
        setProgress(0)
        setIsUploading(false)
      }, 1000)
    } catch (error) {
      console.error("Upload error:", error)
      toast.error("Failed to upload file. Please try again.")
      setIsUploading(false)
      setProgress(0)
    }
  }

  const handleCancel = () => {
    setFile(null)
    setProgress(0)
    setIsUploading(false)
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {!file ? (
        <div
          className={`file-drop-area ${isDragging ? "drag-active" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 rounded-full bg-primary/10">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-medium">Drag and drop your file here</h3>
              <p className="text-sm text-muted-foreground mt-1">or click to browse your files</p>
            </div>
            <Button variant="outline" type="button">
              Select File
            </Button>
          </div>
          <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
        </div>
      ) : (
        <div className="border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-primary/10">
                <Upload className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="font-medium truncate" title={file.name}>
                  {file.name}
                </p>
                <p className="text-sm text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
            {!isUploading && (
              <Button variant="ghost" size="icon" onClick={handleCancel} className="text-muted-foreground">
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>

          {isUploading ? (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <div className="flex justify-between text-sm">
                <span>{progress.toFixed(0)}%</span>
                <span>Uploading...</span>
              </div>
            </div>
          ) : (
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleUpload}>Upload File</Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

