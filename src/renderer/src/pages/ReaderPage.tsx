import { Layout } from '../../../shared/components/Layout'
import PdfViewer from '../../../shared/components/PdfViewer'
import { Toolbar } from '../../../shared/components/Toolbar'
import { WelcomeScreen } from '../../../shared/components/WelcomeScreen'
import { PdfTabBar } from '../../../shared/components/PdfTabBar'

import { usePdfTabs } from '../../src/hooks/usePdfTabs'
import { useEffect, useRef, useState } from 'react'

export function ReaderPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { tabs, activeTab, activeTabId, openPdf, closeTab, switchTab, updateTab } = usePdfTabs()

  const handleFileUpload = async () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.pdf'

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      const arrayBuffer = await file.arrayBuffer()
      const uint8Array = new Uint8Array(arrayBuffer)
      openPdf(uint8Array, file.name)
    }

    input.click()
  }

  const handlePdfLoaded = () => {
    setIsLoading(false);

    setTimeout(() => {
      setShowTabs(true);
    }, 400);
  };

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

    const blob = new Blob([activeTab.data], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const iframe = document.createElement('iframe')

    iframe.style.display = 'none'
    iframe.src = url
    document.body.appendChild(iframe)

    iframe.onload = () => {
      iframe.contentWindow?.print()
      setTimeout(() => {
        document.body.removeChild(iframe)
        URL.revokeObjectURL(url)
      }, 100)
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
  }, [activeTab, activeTabId])

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
        </>
      )}
    </Layout>
  )
}

export default ReaderPage