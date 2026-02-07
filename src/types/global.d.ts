export {}

declare global {
  interface Window {
    electronAPI: {
      openPDFDialog: () => Promise<string | null>
      printPDF: (options: unknown) => void
      getPrinters: () => Promise<Electron.PrinterInfo[]>
      onOpenPDFDialog: (callback: () => void) => void
      removeOpenPDFDialogListeners: () => void
    }
  }
}
