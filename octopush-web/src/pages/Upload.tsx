"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { Button } from "../components/ui/button"
import FileUploader from "../components/FileUploader"

export default function Upload() {
  const navigate = useNavigate()
  const [uploadedShortLink, setUploadedShortLink] = useState<string | null>(null)

  const handleUploadSuccess = (shortLink: string) => {
    setUploadedShortLink(shortLink)

    // Navigate to the file details page after a short delay
    setTimeout(() => {
      navigate(`/files/${shortLink}`)
    }, 500)
  }

  return (
    <div className="container max-w-4xl mx-auto">
      <Button variant="ghost" className="mb-6" onClick={() => navigate(-1)}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Upload File</h1>
        <p className="text-muted-foreground mt-2">Upload your file to share it with others</p>
      </div>

      <FileUploader onUploadSuccess={handleUploadSuccess} />

      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>Maximum file size: Depends how you have on local disks</p>
        <p className="mt-1">Supported file types: All file types are supported</p>
      </div>
    </div>
  )
}

