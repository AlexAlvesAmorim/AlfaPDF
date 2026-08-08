import { PrintOptions } from '@/shared/types'

export {}

export interface SavePdfResult {
  success: boolean
  path?: string
  canceled?: boolean
  error?: string
}

declare global {
  interface Window {
    electronAPI?: {
      openPdfDialog: () => Promise<string[]>
      readPdfFile: (filePath: string) => Promise<string>
      getPrinters: () => Promise<{ name: string; isDefault?: boolean }[]>
      printSilent: (
        options: PrintOptions & { file: Uint8Array }
      ) => Promise<boolean>
      printNative: (
        options: PrintOptions & { file: Uint8Array }
      ) => Promise<{ success: boolean; error?: string | null }>
      saveAsPdf: (
        options: PrintOptions & { file: Uint8Array }
      ) => Promise<SavePdfResult>
      getAppVersion: () => Promise<string>
      onOpenPdfFromSystem: (
        callback: (data: { buffer: Uint8Array; fileName: string }) => void
      ) => void

      // === AUTO-UPDATE ====================================================
      checkForUpdates: () => Promise<boolean>
      quitAndInstall: () => Promise<boolean>
      getUpdateStatus: () => Promise<{ downloaded: boolean; version: string | null }>
      onUpdateChecking: (callback: () => void) => void
      onUpdateAvailable: (
        callback: (info: { version: string; releaseNotes: unknown }) => void
      ) => void
      onUpdateNotAvailable: (callback: (info: { version: string }) => void) => void
      onUpdateProgress: (
        callback: (progress: { percent: number; transferred: number; total: number }) => void
      ) => void
      onUpdateDownloaded: (callback: (info: { version: string }) => void) => void
      onUpdateError: (callback: (error: { message: string }) => void) => void
    }
  }
}