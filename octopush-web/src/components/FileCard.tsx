import { Link } from "react-router-dom"
import { Card, CardContent, CardFooter } from "./ui/card"
import { Download, File, FileText, Image, Music, Video } from "lucide-react"
import { Button } from "./ui/button"
import { formatDistanceToNow } from "date-fns"
import type { FileType } from "../types"

interface FileCardProps {
  file: FileType
}

export default function FileCard({ file }: FileCardProps) {
  const getFileIcon = () => {
    const extension = file.file_name.split(".").pop()?.toLowerCase()

    if (!extension) return <File className="h-10 w-10" />

    if (["jpg", "jpeg", "png", "gif", "svg", "webp"].includes(extension)) {
      return <Image className="h-10 w-10" />
    }

    if (["mp4", "webm", "mov", "avi"].includes(extension)) {
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
    <Card className="overflow-hidden transition-all hover:shadow-md">
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
        <a
          href={`http://localhost:5678/files/download/${file.short_link}`}
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

