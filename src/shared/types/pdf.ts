export interface PdfTab {
  id: string
  name: string
  data: Blob
  url: string
  currentPage: number
  totalPages?: number
  zoom: number
  scrollTop: number
  password?: string
}