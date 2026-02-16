import { useCallback, useState } from 'react'

export default function usePdfLoader() {
  const [file, setFile] = useState<Uint8Array | null>(null)

  const openDialog = useCallback(async () => {
    try {
      if (!window.electronAPI?.openPDFDialog) {
        console.error('Electron API não disponível')
        return
      }

      const filePath = await window.electronAPI.openPDFDialog()

      if (!filePath) return

      const fileData = await window.electronAPI.readPdfFile(filePath)

      setFile(fileData)

    } catch (err) {
  }, [])

  return {
    file,
    openDialog,
  }
}
