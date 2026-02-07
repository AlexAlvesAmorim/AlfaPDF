import { Layout } from '../../../shared/components/Layout'
import  PdfViewer  from '../../../shared/components/PdfViewer'
import { Toolbar } from '../../../shared/components/Toolbar'
import { WelcomeScreen } from '../../../shared/components/WelcomeScreen'

import { usePdfLoader } from '../../../shared/hooks/usePdfLoader'
import { usePdfNavigation } from '../../../shared/hooks/usePdfNavigation'
import { usePdfZoom } from '../../../shared/hooks/usePdfZoom'

export function ReaderPage() {
  const {
    file,
    numPages,
    setNumPages,
    containerRef,
    loadPdf
  } = usePdfLoader()

  const {
    pageNumber,
    goToNextPage,
    goToPrevPage,
    setPage
  } = usePdfNavigation(numPages)

  const {
    scale,
    zoomIn,
    zoomOut,
    resetZoom
  } = usePdfZoom()

  return (
    <Layout>
      {!file ? (
        <WelcomeScreen onOpenPdf={loadPdf} />
      ) : (
        <>
          <Toolbar
            pageNumber={pageNumber}
            numPages={numPages}
            onPrev={goToPrevPage}
            onNext={goToNextPage}
            onZoomIn={zoomIn}
            onZoomOut={zoomOut}
            onResetZoom={resetZoom}
          />

          <PdfViewer
            file={file}
            scale={scale}
            containerRef={containerRef}
            onLoadSuccess={setNumPages}
          />
        </>
      )}
    </Layout>
  )
}
export default ReaderPage;