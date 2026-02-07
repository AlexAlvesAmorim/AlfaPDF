import { Layout } from '../../../shared/components/Layout'
import PdfViewer from '../../../shared/components/PdfViewer'
import { Toolbar } from '../../../shared/components/Toolbar'
import { WelcomeScreen } from '../../../shared/components/WelcomeScreen'

import { usePdfLoader } from '../../../shared/hooks/usePdfLoader'
import { usePdfNavigation } from '../../../shared/hooks/usePdfNavigation'
import { usePdfZoom } from '../../../shared/hooks/usePdfZoom'

export function ReaderPage() {
  const {
    file,
    numPages,
    isLoading,
    error,
    setNumPages,
    containerRef,
    loadPdf,
    printPdf
  } = usePdfLoader()

  const {
    currentPage,
    setCurrentPage,
    goToNextPage,
    goToPrevPage
  } = usePdfNavigation(numPages)

  const {
    scale,
    zoomIn,
    zoomOut,
    resetZoom
  } = usePdfZoom()

  // Exibe loading state
  if (isLoading) {
    return (
      <Layout>
        <div className="loading-container">
          <p>Carregando PDF...</p>
        </div>
      </Layout>
    )
  }

  // Exibe erro se houver
  if (error) {
    return (
      <Layout>
        <div className="error-container">
          <p>Erro: {error}</p>
          <button onClick={loadPdf}>Tentar novamente</button>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      {!file ? (
        <WelcomeScreen onOpenPdf={loadPdf} />
      ) : (
        <>
          <Toolbar
            currentPage={currentPage}
            totalPages={numPages}
            onPrev={goToPrevPage}
            onNext={goToNextPage}
            onZoomIn={zoomIn}
            onZoomOut={zoomOut}
            onResetZoom={resetZoom}
            onPrint={printPdf}
          />

          <PdfViewer
            file={file}
            scale={scale}
            currentPage={currentPage}
            containerRef={containerRef}
            onLoadSuccess={setNumPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </Layout>
  )
}

export default ReaderPage