"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { ArrowLeft, Download, File, FileText, Image, Music, Video, Copy, Check, Calendar, Clock } from "lucide-react"
import { Button } from "../components/ui/button"
import { Card, CardContent } from "../components/ui/card"
import { Skeleton } from "../components/ui/skeleton"
import { getFileByShortLink } from "../services/api"
import type { FileType } from "../types"
import { format } from "date-fns"
import toast from "react-hot-toast"
import { API_BASE_URL } from "../utils/config"

export default function FileDetails() {
  const { shortLink } = useParams<{ shortLink: string }>()
  const navigate = useNavigate()
  const [file, setFile] = useState<FileType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const fetchFile = async () => {
      if (!shortLink) return

      try {
        setLoading(true)
        const fileData = await getFileByShortLink(shortLink)
        setFile(fileData)
        setError(null)
      } catch (err) {
        console.error("Error fetching file:", err)
        setError("Failed to load file details. The file may not exist or has been removed.")
        toast.error("Failed to load file details")
      } finally {
        setLoading(false)
      }
    }

    fetchFile()
  }, [shortLink])

  const getFileIcon = () => {
    if (!file) return <File className="h-12 w-12" />

    const extension = file.file_name.split(".").pop()?.toLowerCase()

    if (!extension) return <File className="h-12 w-12" />

    if (["jpg", "jpeg", "png", "gif", "svg", "webp"].includes(extension)) {
      return <Image className="h-12 w-12" />
    }

    if (["mp4", "webm", "mov", "avi", "mkv"].includes(extension)) {
      return <Video className="h-12 w-12" />
    }

    if (["mp3", "wav", "ogg", "flac"].includes(extension)) {
      return <Music className="h-12 w-12" />
    }

    if (["txt", "pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx"].includes(extension)) {
      return <FileText className="h-12 w-12" />
    }

    return <File className="h-12 w-12" />
  }

  const copyDownloadLink = () => {
    if (!shortLink) return

    const downloadUrl = `${API_BASE_URL}/files/download/${shortLink}`
    navigator.clipboard.writeText(downloadUrl)
    setCopied(true)
    toast.success("Download link copied to clipboard")

    setTimeout(() => {
      setCopied(false)
    }, 2000)
  }

  return (
    <div className="container max-w-4xl mx-auto lg:space-y-24">
      <Button variant="ghost" className="mb-6" onClick={() => navigate(-1)}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      {loading ? (
        <Card>
          <CardContent className="p-8">
            <div className="flex flex-col items-center gap-6">
              <Skeleton className="h-20 w-20 rounded-lg" />
              <div className="space-y-2 w-full max-w-md">
                <Skeleton className="h-8 w-3/4 mx-auto" />
                <Skeleton className="h-4 w-1/2 mx-auto" />
                <div className="pt-6">
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : error ? (
        <Card>
          <CardContent className="p-8 text-center">
            <File className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">File Not Found</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Link to="/">
              <Button>Return to Files</Button>
            </Link>
          </CardContent>
        </Card>
      ) : file ? (
        <Card>
          <CardContent className="p-16 transition-colors hover:bg-muted/50">
            <div className="flex flex-col items-center gap-6">
              <div className="p-6 bg-muted rounded-xl">{getFileIcon()}</div>

              <div className="text-center">
                <h1 className="text-md font-bold mb-2">{file.file_name}</h1>
                <p className="text-muted-foreground">Short Link: {file.short_link}</p>
                <p className="text-muted-foreground">Group Name: {file.group_name}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-md">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Uploaded: {format(new Date(file.time_updated), "PPP")}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Time: {format(new Date(file.time_updated), "p")}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
                <Button className="flex-1" onClick={copyDownloadLink} variant="outline">
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Link
                    </>
                  )}
                </Button>

                <a
                  href={`${API_BASE_URL}/files/download/${file.short_link}`}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}

