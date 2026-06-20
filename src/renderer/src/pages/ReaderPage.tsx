import PrintDialog from '../../PrintDialog'
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
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.pdf'

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      const arrayBuffer = await file.arrayBuffer()
      const uint8Array = new Uint8Array(arrayBuffer)

      await tryOpenPdf(uint8Array, file.name)
    }

    input.click()
  }

  const tryOpenPdf = async (bytes: Uint8Array, name: string, password?: string) => {
    console.log('[tryOpenPdf] chamado, password:', password)
    try {
      const blob = new Blob(
        [new Uint8Array(bytes)],
        { type: 'application/pdf' }
      )
      const url = URL.createObjectURL(blob)
      await loadPdf(url, password)
      console.log('[tryOpenPdf] loadPdf ok, abrindo tab')
      openPdf(blob, name, password) // passa o Blob, não o Uint8Array
    } catch (err: any) {
      console.log('[tryOpenPdf] erro capturado:', err.message)
      if (err.message === 'PASSWORD_REQUIRED') {
        setPasswordDialog({ open: true, bytes, name, wrongPassword: false })
      } else if (err.message === 'PASSWORD_WRONG') {
        setPasswordDialog({ open: true, bytes, name, wrongPassword: true })
      } else {
        showToast('Erro ao abrir o PDF.', 'error')
      }
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

  const handlePrint = async (options: PrintOptions) => {
    if (!window.electronAPI?.printSilent || !activeTab?.data) return

    try {
      const arrayBuffer = await (activeTab.data as Blob).arrayBuffer()
      const file = new Uint8Array(arrayBuffer)

      await window.electronAPI.printSilent({
        ...options,
        file,
        currentPage: activeTab.currentPage,
        password: activeTab.password, // 👈
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
        password: activeTab.password, // 👈
      })

      if (result?.success) {
        showToast(`PDF salvo com sucesso em: ${result.path}`, 'success', 6000)
      } else if (result?.canceled) {
      } else {
        showToast(`Falha ao salvar PDF: ${result?.error ?? 'Erro desconhecido'}`, 'error')
      }
    } catch (err: any) {
      console.error('Erro ao salvar como PDF:', err)
      showToast('Erro inesperado ao tentar salvar o PDF.', 'error')
    }
  }

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
  }, [activeTab, activeTabId, closeTab])

  return (
    <Layout>
      {!activeTab ? (
        <WelcomeScreen onOpenPdf={handleFileUpload} />
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

          <PrintDialog
            open={printDialogOpen}
            onClose={() => setPrintDialogOpen(false)}
            onPrint={handlePrint}
            onSaveAsPdf={handleSaveAsPdf}
            currentPage={activeTab?.currentPage ?? 1}
            totalPages={activeTab?.totalPages ?? 0}
          />
        </>
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