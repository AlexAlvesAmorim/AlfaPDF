import { Layout } from '../../../shared/components/Layout'
import PdfViewer from '../../../shared/components/PdfViewer'
import { Toolbar } from '../../../shared/components/Toolbar'
import { PdfTabBar } from '../../../shared/components/PdfTabBar'
import { WelcomeScreen } from '../../../shared/components/WelcomeScreen'
import { usePdfTabs } from '../../../shared/hooks/usePdfTabs'
import { useRef } from 'react'

export function ReaderPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  
  const {
    tabs,
    activeTabId,
    activeTab,
    addTab,
    closeTab,
    switchTab,
    updateTab
  } = usePdfTabs()

  const handleOpenPdf = async () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.pdf'
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      const arrayBuffer = await file.arrayBuffer()
      const data = new Uint8Array(arrayBuffer)

      addTab({
        name: file.name,
        data: data,
        currentPage: 1,
        totalPages: 0,
        zoom: 1.0,
        scrollTop: 0
      })
    }
    
    input.click()
  }

  const handlePrint = () => {
    window.print()
  }

  const handleZoomIn = () => {
    if (!activeTab) return
    const newZoom = Math.min(activeTab.zoom * 1.2, 3.0)
    updateTab({ zoom: newZoom })
  }

  const handleZoomOut = () => {
    if (!activeTab) return
    const newZoom = Math.max(activeTab.zoom / 1.2, 0.5)
    updateTab({ zoom: newZoom })
  }

  const handleResetZoom = () => {
    if (!activeTab) return
    updateTab({ zoom: 1.0 })
  }

  const handleNextPage = () => {
    if (!activeTab || !activeTab.totalPages) return
    if (activeTab.currentPage < activeTab.totalPages) {
      updateTab({ currentPage: activeTab.currentPage + 1 })
    }
  }

  const handlePrevPage = () => {
    if (!activeTab) return
    if (activeTab.currentPage > 1) {
      updateTab({ currentPage: activeTab.currentPage - 1 })
    }
  }

  const handleFirstPage = () => {
    if (!activeTab) return
    updateTab({ currentPage: 1 })
  }

  const handleLastPage = () => {
    if (!activeTab || !activeTab.totalPages) return
    updateTab({ currentPage: activeTab.totalPages })
  }

  return (
    <Layout>
      {tabs.length === 0 ? (
        <WelcomeScreen onOpenPdf={handleOpenPdf} />
      ) : (
        <div className="pdf-workspace">
          <PdfTabBar
            tabs={tabs}
            activeTabId={activeTabId}
            onSwitchTab={switchTab}
            onCloseTab={closeTab}
          />
          
          {activeTab && (
            <Toolbar
              currentPage={activeTab.currentPage}
              totalPages={activeTab.totalPages || 0}
              zoomPercentage={Math.round(activeTab.zoom * 100)}
              onPrev={handlePrevPage}
              onNext={handleNextPage}
              onFirstPage={handleFirstPage}
              onLastPage={handleLastPage}
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
              onResetZoom={handleResetZoom}
              onPrint={handlePrint}
            />
          )}
          
          {activeTab && (
            <PdfViewer
              tab={activeTab}
              containerRef={containerRef}
              onTabUpdate={updateTab}
              onLoadSuccess={(numPages) => {
                updateTab({ totalPages: numPages })
              }}
            />
          )}
        </div>
      )}
    </Layout>
  )
}

export default ReaderPage