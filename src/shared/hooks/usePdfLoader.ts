import { useCallback, useRef, useState } from 'react'

declare global {
  interface Window {
    electronAPI: {
      openPDFDialog: () => Promise<string[]>
      readPdfFile: (filePath: string) => Promise<string>
      printPdf?: (filePath: string) => Promise<void>
    }
  }
}

export function usePdfLoader() {
  const [file, setFile] = useState<Uint8Array | null>(null)
  const [numPages, setNumPages] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentFilePath, setCurrentFilePath] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const loadPdf = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const filePaths = await window.electronAPI.openPDFDialog()
      const filePath = filePaths?.[0]

      if (!filePath) {
        setIsLoading(false)
        return
      }

      const base64 = await window.electronAPI.readPdfFile(filePath)

      const binary = atob(base64)
      const buffer = new Uint8Array(binary.length)
      for (let i = 0; i < binary.length; i++) {
        buffer[i] = binary.charCodeAt(i)
      }

      const bufferCopy = new Uint8Array(buffer)

      setFile(bufferCopy)
      setCurrentFilePath(filePath)
      setIsLoading(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido ao carregar PDF')
      setIsLoading(false)
    }
  }, [])

  const closePdf = useCallback(() => {
    setFile(null)
    setNumPages(0)
    setCurrentFilePath(null)
    setError(null)
  }, [])

  const printPdf = useCallback(async () => {
    if (!currentFilePath) return

    try {
      if (window.electronAPI.printPdf) {
        await window.electronAPI.printPdf(currentFilePath)
      } else {
        window.print()
      }
    } catch (err) {
      setError('Erro ao imprimir PDF')
    }
  }, [currentFilePath])

  return {
    file,
    numPages,
    isLoading,
    error,
    setNumPages,
    containerRef,
    loadPdf,
    closePdf,
    printPdf
  }
}