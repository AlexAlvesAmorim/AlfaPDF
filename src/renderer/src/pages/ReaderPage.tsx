import PrintDialog from '../../../shared/components/PrintDialog'
import type { PrintOptions } from '../../../shared/types'
import { Layout } from '../../../shared/components/Layout'
import PdfViewer from '../../../shared/components/PdfViewer'
import { Toolbar } from '../../../shared/components/Toolbar'
import { WelcomeScreen } from '../../../shared/components/WelcomeScreen'
import { PdfTabBar } from '../../../shared/components/PdfTabBar'
import { ToastContainer } from '../../../shared/components/Toast'
import { usePdfTabs } from '../../../shared/hooks/usePdfTabs'
import { useToast } from '../../../shared/hooks/useToast'
import { useEffect, useRef, useState } from 'react'
import { loadPdf } from '../modules/documents/infra/pdf/PdfReaderService'
import { PasswordDialog } from '../../../shared/components/PasswordDialog'

export function ReaderPage() {
  const [passwordDialog, setPasswordDialog] = useState<{
    open: boolean
    bytes: Uint8Array
    name: string
    wrongPassword: boolean
  } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const { tabs, activeTab, activeTabId, openPdf, closeTab, switchTab, updateTab } = usePdfTabs()
  const [printDialogOpen, setPrintDialogOpen] = useState(false)
  const { toasts, showToast, removeToast } = useToast()

  const handleFileUpload = async () => {
    const paths = await window.electronAPI?.openPdfDialog()
    if (!paths?.length) return

    await openPath(paths[0])
  }

  const openPath = async (filePath: string) => {
    try {
      const base64 = await window.electronAPI?.readPdfFile(filePath)
      if (!base64) return
      const binary = atob(base64)
      const bytes = new Uint8Array(binary.length)
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
      const name = filePath.split(/[\\/]/).pop() || 'documento.pdf'

      await tryOpenPdf(bytes, name)
    } catch (err) {
      console.error('Erro ao abrir arquivo:', err)
      showToast('Erro ao abrir o arquivo.', 'error')
    }
  }

  const tryOpenPdf = async (bytes: Uint8Array, name: string, password?: string) => {
    const blob = new Blob(
      [new Uint8Array(bytes)],
      { type: 'application/pdf' }
    )
    const url = URL.createObjectURL(blob)
    try {
      await loadPdf(url, password)
      openPdf(blob, name, password)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      if (message === 'PASSWORD_REQUIRED') {
        setPasswordDialog({ open: true, bytes, name, wrongPassword: false })
      } else if (message === 'PASSWORD_WRONG') {
        setPasswordDialog({ open: true, bytes, name, wrongPassword: true })
      } else {
        showToast('Erro ao abrir o PDF.', 'error')
      }
    } finally {
      URL.revokeObjectURL(url)
    }
  }

  const handlePasswordSubmit = async (password: string) => {
    if (!passwordDialog) return
    const { bytes, name } = passwordDialog
    setPasswordDialog(null)
    await tryOpenPdf(bytes, name, password)
  }

  const goToNextPage = () => {
    if (!activeTab) return
    const nextPage = Math.min(activeTab.currentPage + 1, activeTab.totalPages || activeTab.currentPage)
    updateTab(activeTab.id, { currentPage: nextPage })
  }

  const goToPrevPage = () => {
    if (!activeTab) return
    const prevPage = Math.max(activeTab.currentPage - 1, 1)
    updateTab(activeTab.id, { currentPage: prevPage })
  }

  const goToFirstPage = () => {
    if (!activeTab) return
    updateTab(activeTab.id, { currentPage: 1 })
  }

  const goToLastPage = () => {
    if (!activeTab || !activeTab.totalPages) return
    updateTab(activeTab.id, { currentPage: activeTab.totalPages })
  }

  const handleZoomIn = () => {
    if (!activeTab) return
    const newZoom = Math.min(activeTab.zoom + 0.2, 3.0)
    updateTab(activeTab.id, { zoom: newZoom })
  }

  const handleZoomOut = () => {
    if (!activeTab) return
    const newZoom = Math.max(activeTab.zoom - 0.2, 0.5)
    updateTab(activeTab.id, { zoom: newZoom })
  }

  const handleResetZoom = () => {
    if (!activeTab) return
    updateTab(activeTab.id, { zoom: 1.0 })
  }

  const printPdf = () => {
    if (!activeTab) return
    setPrintDialogOpen(true)
  }

  const printAdvanced = async () => {
    if (!window.electronAPI?.printNative || !activeTab?.data) return

    try {
      const arrayBuffer = await (activeTab.data as Blob).arrayBuffer()
      const file = new Uint8Array(arrayBuffer)

      await window.electronAPI.printNative({
        copies: 1,
        color: true,
        duplex: 'simplex',
        pageRange: 'all',
        currentPage: activeTab.currentPage,
        printBackground: true,
        printQuality: 'normal',
        silent: false,
        file,
        password: activeTab.password,
      })
    } catch (err) {
      console.error('Erro na impressão avançada:', err)
      showToast('Erro ao abrir diálogo de impressão.', 'error')
    }
  }

  const handlePrint = async (options: PrintOptions) => {
    if (!window.electronAPI?.printSilent || !activeTab?.data) return

    try {
      const arrayBuffer = await (activeTab.data as Blob).arrayBuffer()
      const file = new Uint8Array(arrayBuffer)

      await window.electronAPI.printSilent({
        ...options,
        file,
        currentPage: activeTab.currentPage,
        password: activeTab.password,
      })
    } catch (err) {
      console.error('Erro ao imprimir:', err)
      showToast('Erro ao enviar para impressão.', 'error')
    }
  }

  const handleSaveAsPdf = async (options: PrintOptions) => {
    if (!window.electronAPI?.saveAsPdf || !activeTab?.data) {
      showToast('Nenhum PDF carregado para salvar.', 'error')
      return
    }

    try {
      const arrayBuffer = await (activeTab.data as Blob).arrayBuffer()
      const file = new Uint8Array(arrayBuffer)

      const result = await window.electronAPI.saveAsPdf({
        ...options,
        file,
        currentPage: activeTab.currentPage,
        password: activeTab.password,
      })

      if (result?.success) {
        showToast(`PDF salvo com sucesso em: ${result.path}`, 'success', 6000)
      } else if (!result?.canceled) {
        showToast(`Falha ao salvar PDF: ${result?.error ?? 'Erro desconhecido'}`, 'error')
      }
    } catch (err: unknown) {
      console.error('Erro ao salvar como PDF:', err)
      showToast('Erro inesperado ao tentar salvar o PDF.', 'error')
    }
  }
  useEffect(() => {
    if (!window.electronAPI?.onOpenPdfFromSystem) return

    window.electronAPI.onOpenPdfFromSystem(({ buffer, fileName }) => {
      tryOpenPdf(buffer, fileName)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault()
          goToPrevPage()
          break
        case 'ArrowDown':
          e.preventDefault()
          goToNextPage()
          break
        case 'PageUp':
          e.preventDefault()
          goToPrevPage()
          break
        case 'PageDown':
          e.preventDefault()
          goToNextPage()
          break
        case '+':
        case '=':
          e.preventDefault()
          handleZoomIn()
          break
        case '-':
          e.preventDefault()
          handleZoomOut()
          break
        case '0':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            handleResetZoom()
          }
          break
        case 'p':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            printPdf()
          }
          break
        case 'w':
          if ((e.ctrlKey || e.metaKey) && activeTabId) {
            e.preventDefault()
            closeTab(activeTabId)
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, activeTabId, closeTab])

  return (
    <Layout>
      {!activeTab ? (
        <WelcomeScreen onOpenPdf={handleFileUpload} onOpenRecent={openPath} />
      ) : (
        <>
          <PdfTabBar
            tabs={tabs}
            activeTabId={activeTabId}
            onSwitchTab={switchTab}
            onCloseTab={closeTab}
          />

          <Toolbar
            currentPage={activeTab.currentPage}
            totalPages={activeTab.totalPages || 0}
            zoomPercentage={Math.round(activeTab.zoom * 100)}
            isDocked={false}
            isScrolled={false}
            onPrev={goToPrevPage}
            onNext={goToNextPage}
            onFirstPage={goToFirstPage}
            onLastPage={goToLastPage}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onResetZoom={handleResetZoom}
            onPrint={printPdf}
            onOpenPdf={handleFileUpload}
          />

          <PdfViewer
            key={activeTab.id}
            tab={activeTab}
            containerRef={containerRef}
            onTabUpdate={(updates) => updateTab(activeTab.id, updates)}
            onLoadSuccess={(numPages) => updateTab(activeTab.id, { totalPages: numPages })}
          />
        </>
      )}

      {printDialogOpen && activeTab && (
        <PrintDialog
          open={printDialogOpen}
          onClose={() => setPrintDialogOpen(false)}
          onPrint={handlePrint}
          onSaveAsPdf={handleSaveAsPdf}
          onPrintAdvanced={printAdvanced}
          currentPage={activeTab.currentPage}
          totalPages={activeTab.totalPages || 0}
          fileName={activeTab.name}
        />
      )}
      {passwordDialog?.open && (
        <PasswordDialog
          wrongPassword={passwordDialog.wrongPassword}
          onConfirm={handlePasswordSubmit}
          onCancel={() => setPasswordDialog(null)}
        />
      )}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </Layout>
  )
}


export default ReaderPage