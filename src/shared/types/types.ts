export type PrintQuality = 'draft' | 'normal' | 'high'

export interface PrintSettings {
  printerName?: string
  copies: number
  color: boolean
  pageRange: 'all' | 'current' | 'custom'
  customPages?: string
  printQuality: PrintQuality
}

export interface PrintOptions {
  printerName?: string
  copies: number
  color: boolean
  duplex: 'simplex' | 'longEdge' | 'shortEdge'
  silent: boolean
  printBackground: boolean
  pageRange: 'all' | 'current' | 'custom'
  customPages?: string
  currentPage?: number
  password?: string
  printQuality: PrintQuality
}