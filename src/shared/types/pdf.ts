export interface PdfTab {
  id: string
  name: string
  data: Uint8Array
  currentPage: number
  totalPages?: number
  zoom: number
  scrollTop: number
}