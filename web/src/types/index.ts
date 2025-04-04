export interface FileType {
  short_link: string
  file_name: string
  group_name: string
  time_updated: string
}

export interface PaginatedResponse {
  files: FileType[]
  meta: {
    total: number
    page: number
    page_size: number
  }
}

