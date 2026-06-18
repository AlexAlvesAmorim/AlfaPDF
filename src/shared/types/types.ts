export interface PrintOptions {
  printerName: string
  copies: number
  color: boolean
  duplex: 'simplex' | 'longEdge' | 'shortEdge'
  silent: boolean
  printBackground: boolean
  pageRange: 'all' | 'current' | 'custom'
  customPages?: string
  currentPage?: number
}