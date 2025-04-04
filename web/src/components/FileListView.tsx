"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { formatDistanceToNow, format } from "date-fns"
import { Download, File, FileText, Image, Music, Video, ChevronUp, ChevronDown, Trash } from "lucide-react"
import { Button } from "./ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import type { FileType } from "../types"
import { API_BASE_URL } from "../utils/config"
import toast from "react-hot-toast"


interface FileListViewProps {
  files: FileType[]
  onDelete?: (deletedShortLink: string) => void
}

type SortField = "file_name" | "time_updated"
type SortDirection = "asc" | "desc"

export default function FileListView({ files, onDelete }: FileListViewProps) {
  const [sortField, setSortField] = useState<SortField>("time_updated")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
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
      console.error("Delete error:", error)
      toast.error("Failed to delete file")
    } finally {
      setDeletingLinks(prev => prev.filter(link => link !== shortLink))
    }
  }

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase()

    if (!extension) return <File className="h-4 w-4" />

    if (["jpg", "jpeg", "png", "gif", "svg", "webp"].includes(extension)) {
      return <Image className="h-4 w-4" />
    }

    if (["mp4", "webm", "mov", "avi", "mkv"].includes(extension)) {
      return <Video className="h-4 w-4" />
    }

    if (["mp3", "wav", "ogg", "flac"].includes(extension)) {
      return <Music className="h-4 w-4" />
    }

    if (["txt", "pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx"].includes(extension)) {
      return <FileText className="h-4 w-4" />
    }

    return <File className="h-4 w-4" />
  }

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const sortedFiles = [...files].sort((a, b) => {
    if (sortField === "file_name") {
      return sortDirection === "asc" ? a.file_name.localeCompare(b.file_name) : b.file_name.localeCompare(a.file_name)
    } else {
      const dateA = new Date(a.time_updated).getTime()
      const dateB = new Date(b.time_updated).getTime()
      return sortDirection === "asc" ? dateA - dateB : dateB - dateA
    }
  })

  const SortIcon = ({ field }: { field: SortField }) => {
    if (field !== sortField) return null

    return sortDirection === "asc" ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12"></TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort("file_name")}>
              <div className="flex items-center">
                File Name
                <SortIcon field="file_name" />
              </div>
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort("time_updated")}>
              <div className="flex items-center">
                Date Uploaded
                <SortIcon field="time_updated" />
              </div>
            </TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedFiles.map((file) => (
            <TableRow key={file.short_link}>
              <TableCell className="w-12">
                <div className="flex justify-center">{getFileIcon(file.file_name)}</div>
              </TableCell>
              <TableCell>
                <Link to={`/files/${file.short_link}`} className="text-sm font-medium hover:underline">
                  {file.file_name}
                </Link>
                <div className="text-xs text-muted-foreground md:hidden">
                  {formatDistanceToNow(new Date(file.time_updated), { addSuffix: true })}
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <div className="text-sm">{file.group_name}</div>
                <div className="text-xs text-muted-foreground">{file.group_name}</div>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <div className="text-sm">{format(new Date(file.time_updated), "PPP")}</div>
                <div className="text-xs text-muted-foreground">{format(new Date(file.time_updated), "p")}</div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(file.short_link)}
                    disabled={deletingLinks.includes(file.short_link)}
                  >
                    <Trash className="h-3 w-3 mr-1" />
                    {deletingLinks.includes(file.short_link) ? "Deleting..." : "Delete"}
                  </Button>
                  <a
                    href={`${API_BASE_URL}/files/download/${file.short_link}`}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm">
                      <Download className="h-3 w-3 mr-1" />
                      Download
                    </Button>
                  </a>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

