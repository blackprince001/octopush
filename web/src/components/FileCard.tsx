import { Link } from "react-router-dom"
import { Card, CardContent, CardFooter } from "./ui/card"
import { Download, File, FileText, Image, Music, Video, Trash } from "lucide-react"
import { Button } from "./ui/button"
import { formatDistanceToNow } from "date-fns"
import type { FileType } from "../types"
import { API_BASE_URL } from "../utils/config"
import { useState } from "react"
import toast from "react-hot-toast"


interface FileCardProps {
  file: FileType
  onDelete?: (deletedShortLink: string) => void
}

export default function FileCard({ file, onDelete }: FileCardProps) {
  const [deletingLinks, setDeletingLinks] = useState<string[]>([])

  const handleDelete = async (shortLink: string) => {
    if (!window.confirm("Are you sure you want to delete this file?")) return

    setDeletingLinks(prev => [...prev, shortLink])

    try {
      const response = await fetch(`${API_BASE_URL}/files/item/${shortLink}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      onDelete?.(shortLink)
      toast.success("File deleted")
    } catch (error) {
      toast.error("Failed to delete file")
    } finally {
      setDeletingLinks(prev => prev.filter(link => link !== shortLink))
    }
  }

  const getFileIcon = () => {
    const extension = file.file_name.split(".").pop()?.toLowerCase()

    if (!extension) return <File className="h-10 w-10" />

    if (["jpg", "jpeg", "png", "gif", "svg", "webp"].includes(extension)) {
      return <Image className="h-10 w-10" />
    }

    if (["mp4", "webm", "mov", "avi", "mkv"].includes(extension)) {
      return <Video className="h-10 w-10" />
    }

    if (["mp3", "wav", "ogg", "flac"].includes(extension)) {
      return <Music className="h-10 w-10" />
    }

    if (["txt", "pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx"].includes(extension)) {
      return <FileText className="h-10 w-10" />
    }

    return <File className="h-10 w-10" />
  }

  return (
    <Card className="overflow-hidden transition-colors hover:bg-muted/50">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="rounded-lg bg-muted p-2 flex items-center justify-center">{getFileIcon()}</div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-lg truncate" title={file.file_name}>
              {file.file_name}
            </h3>
            <p className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(file.time_updated), { addSuffix: true })}
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-muted/50 p-4 flex justify-between">
        <Link to={`/files/${file.short_link}`}>
          <Button variant="ghost" size="sm">
            View details
          </Button>
        </Link>

        <div className="flex gap-2">
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleDelete(file.short_link)}
            disabled={deletingLinks.includes(file.short_link)}
          >
            <Trash className="h-4 w-4 mr-2" />
            {deletingLinks.includes(file.short_link) ? "Deleting..." : "Delete"}
          </Button>
        </div>

        <a
          href={`${API_BASE_URL}/files/download/item/${file.short_link}`}
          download
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </a>
      </CardFooter>
    </Card>
  )
}

