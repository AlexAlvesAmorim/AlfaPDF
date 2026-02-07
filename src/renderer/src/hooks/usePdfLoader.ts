import { useCallback, useState } from 'react'

export default function usePdfLoader() {
  const [file, setFile] = useState<string | null>(null)

  const openDialog = useCallback(async () => {
    try {
      if (!window.electronAPI?.openPDFDialog) {
        console.error('Electron API não disponível')
        return
      }

      const result = await window.electronAPI.openPDFDialog()

      let filePath: string | null = null

      if (Array.isArray(result)) {
        filePath = result[0]
      } else if (typeof result === 'string') {
        filePath = result
      }

      if (!filePath) {
        return
      }

const loadPDF = async (filePath: string) => {
  if (!window.electronAPI) return;

  const base64 = await window.electronAPI.getFileContent(filePath);

  const binary = atob(base64);
  const len = binary.length;
  const buffer = new Uint8Array(len);

  for (let i = 0; i < len; i++) {
    buffer[i] = binary.charCodeAt(i);
  }

  setFile(buffer);
};


      console.log('PDF carregado:', filePath)
      setFile(filePath)
    } catch (err) {
      console.error('Erro ao abrir PDF:', err)
    }
  }, [])

  return {
    file,
    openDialog,
  }
}
