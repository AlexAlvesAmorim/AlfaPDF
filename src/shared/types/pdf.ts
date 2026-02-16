export interface PdfTab {
  id: string
  name: string
  data: Blob
  currentPage: number
  totalPages?: number
  zoom: number
  scrollTop: number
}