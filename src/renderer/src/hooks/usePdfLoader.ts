import { useCallback, useState } from 'react'

export default function usePdfLoader() {
  const [file, setFile] = useState<Uint8Array | null>(null)

  const openDialog = useCallback(async () => {
    try {
      if (!window.electronAPI?.openPDFDialog) {
        return
      }

      const filePath = await window.electronAPI.openPDFDialog()

      if (!filePath) return

      const fileData = await window.electronAPI.readPdfFile(filePath)

      setFile(fileData)
    } catch (err) {
      // Erro silencioso — pode ser tratado no componente que chama o hook, se necessário
    }
  }, [])

  return {
    file,
    openDialog,
  }
}