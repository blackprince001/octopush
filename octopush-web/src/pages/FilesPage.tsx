"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Upload, FileQuestion } from "lucide-react"
import { Button } from "../components/ui/button"
import { Card, CardContent } from "../components/ui/card"
import { Skeleton } from "../components/ui/skeleton"
import FileCard from "../components/FileCard"
import Pagination from "../components/Pagination"
import { getFiles } from "../services/api"
import type { FileType } from "../types"
import toast from "react-hot-toast"

export default function FilesPage() {
  const [files, setFiles] = useState<FileType[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        setLoading(true)

        const response = await getFiles(currentPage)
        setFiles(response.files)
        setTotalPages(Math.ceil(response.meta.total / response.meta.page_size))
        setError(null)
      } catch (err) {
        console.error("Error fetching files:", err)
        setError("Failed to load files. Please try again later.")
        toast.error("Failed to load files")
      } finally {
        setLoading(false)
      }
    }

    fetchFiles()
  }, [currentPage])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  return (
    <div className="container max-w-6xl mx-auto py-16">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Files</h1>
          <p className="text-muted-foreground mt-1">Manage and access your uploaded files</p>
        </div>
        <Link to="/upload">
          <Button>
            <Upload className="h-4 w-4 mr-2" />
            Upload File
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-14 w-14 rounded-lg" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              </CardContent>
              <div className="p-4 bg-muted/50">
                <Skeleton className="h-9 w-full" />
              </div>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
            <FileQuestion className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium">Error Loading Files</h3>
            <p className="text-muted-foreground mt-1 mb-4">{error}</p>
            <Button onClick={() => setCurrentPage(1)}>Try Again</Button>
          </CardContent>
        </Card>
      ) : files.length === 0 ? (
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
            <FileQuestion className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium">No Files Found</h3>
            <p className="text-muted-foreground mt-1 mb-4">
              You haven't uploaded any files yet. Start by uploading your first file.
            </p>
            <Link to="/upload">
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Upload File
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {files.map((file) => (
              <FileCard key={file.short_link} file={file} />
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
          )}
        </>
      )}
    </div>
  )
}

