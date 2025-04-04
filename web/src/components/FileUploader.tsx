"use client"

import { useState, useRef, type DragEvent, type ChangeEvent } from "react"
import { Upload, X } from "lucide-react"
import { Button } from "./ui/button"
import { Progress } from "./ui/progress"
import { uploadFile, uploadMultipleFiles } from "../services/api"
import toast from "react-hot-toast"

interface FileUploaderProps {
  onUploadSuccess?: (shortLinks: string[]) => void
}

export default function FileUploader({ onUploadSuccess }: FileUploaderProps) {
  const [files, setFiles] = useState<File[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [groupName, setGroupName] = useState("")
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
      setFiles((prevFiles) => [...prevFiles, ...Array.from(e.dataTransfer.files)])
    }
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles((prevFiles) => [...prevFiles, ...Array.from(e.target.files || [])])
    }
  }

  const handleUpload = async () => {
    if (files.length === 0) return

    setIsUploading(true)
    setProgress(0)

    try {
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + Math.random() * 10
          return newProgress > 90 ? 90 : newProgress
        })
      }, 300)

      let responses
      if (files.length === 1) {
        responses = [await uploadFile(files[0])]
      } else {
        const finalGroupName = groupName.trim() || `group-${Date.now()}`
        responses = await uploadMultipleFiles(files, finalGroupName)
      }

      clearInterval(progressInterval)
      setProgress(100)

      toast.success("Files uploaded successfully!")

      if (onUploadSuccess) {
        if (Array.isArray(responses)) {
          onUploadSuccess(responses.map((response: { url: string }) => response.url))
        } else {
          onUploadSuccess(responses.urls)
        }
      }

      setTimeout(() => {
        setFiles([])
        setProgress(0)
        setIsUploading(false)
        setGroupName("")
      }, 1000)
    } catch (error) {
      console.error("Upload error:", error)
      toast.error("Failed to upload files. Please try again.")
      setIsUploading(false)
      setProgress(0)
    }
  }

  const handleCancel = () => {
    setFiles([])
    setProgress(0)
    setIsUploading(false)
    setGroupName("")
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {files.length === 0 ? (
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
              <h3 className="text-lg font-medium">Drag and drop your files here</h3>
              <p className="text-sm text-muted-foreground mt-1">or click to browse your files</p>
            </div>
            <Button variant="outline" type="button">
              Select Files
            </Button>
          </div>
          <input
            type="file"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
            multiple
          />
        </div>
      ) : (
        <div className="border rounded-lg p-6">
          <div className="space-y-4">
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-primary/10">
                    <Upload className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate" title={file.name}>
                      {file.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                {!isUploading && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index))
                    }}
                    className="text-muted-foreground"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-col items-center">
            <label
              htmlFor="group-name"
              className="block text-sm font-medium text-muted-foreground mb-2"
            >
              Group Name (optional)
            </label>
            <input
              id="group-name"
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-3/4 rounded-lg border border-gray-300 bg-background px-4 py-2 text-center shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              placeholder="Enter a group name"
            />
          </div>

          {isUploading ? (
            <div className="space-y-2 mt-4">
              <Progress value={progress} className="h-2" />
              <div className="flex justify-between text-sm">
                <span>{progress.toFixed(0)}%</span>
                <span>Uploading...</span>
              </div>
            </div>
          ) : (
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleUpload}>Upload Files</Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
