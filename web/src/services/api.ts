import { API_BASE_URL } from "../utils/config"
import type { FileType, PaginatedResponse } from "../types"

export async function getFiles(page = 1, pageSize = 9): Promise<PaginatedResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/files?page=${page}&page_size=${pageSize}`)

    if (!response.ok) {
      throw new Error(`Error fetching files: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("API error:", error)
    throw error
  }
}

export async function getFileByShortLink(shortLink: string): Promise<FileType> {
  try {
    const response = await fetch(`${API_BASE_URL}/files/item/${shortLink}`)

    if (!response.ok) {
      throw new Error(`Error fetching file: ${response.status}`)
    }

    const data = await response.json()
    const file = data.file

    if (!file) {
      throw new Error("File not found")
    }

    return file
  } catch (error) {
    console.error("API error:", error)
    throw error
  }
}

export async function uploadFile(file: File): Promise<{ url: string }> {
  try {
    const formData = new FormData()
    formData.append("file", file)

    const response = await fetch(`${API_BASE_URL}/files/upload`, {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`Error uploading file: ${response.status}`)
    }

    const data = await response.json()
    return { url: data.url }
  } catch (error) {
    console.error("API error:", error)
    throw error
  }
}

export async function uploadMultipleFiles(files: File[], groupName: string): Promise<{ urls: string[] }> {
  try {
    const formData = new FormData()
    files.forEach((file) => formData.append("files", file))

    const response = await fetch(`${API_BASE_URL}/files/${groupName}`, {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`Error uploading files: ${response.status}`)
    }

    const data = await response.json()
    return { urls: data.urls }
  } catch (error) {
    console.error("API error:", error)
    throw error
  }
}
