// src/shared/components/PdfViewer.tsx
import { Document, Page, pdfjs } from 'react-pdf'
import { RefObject, useEffect, useState, useMemo } from 'react'

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url
).toString()

interface PdfViewerProps {
  file: Uint8Array | null
  scale: number
  currentPage: number
  containerRef: RefObject<HTMLDivElement>
  onLoadSuccess: (numPages: number) => void
  onPageChange?: (page: number) => void
}

function PdfViewer({
  file,
  scale,
  currentPage,
  containerRef,
  onLoadSuccess,
  onPageChange
}: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number>(0)

  // Memoizar o objeto file para evitar recreações
  const fileData = useMemo(() => {
    if (!file) return null
    return { data: file }
  }, [file])

  // Scroll para a página atual quando mudar
  useEffect(() => {
    if (!containerRef.current) return
    
    const pageElement = containerRef.current.querySelector(
      `[data-page-number="${currentPage}"]`
    ) as HTMLElement
    
    if (pageElement) {
      pageElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
    }
  }, [currentPage, containerRef])

  // IntersectionObserver para atualizar página atual ao scrollar manualmente
  useEffect(() => {
    if (!containerRef.current || !onPageChange || numPages === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            const pageNum = parseInt(
              entry.target.getAttribute('data-page-number') || '1',
              10
            )
            onPageChange(pageNum)
          }
        })
      },
      {
        root: containerRef.current,
        threshold: 0.5
      }
    )

    const pages = containerRef.current.querySelectorAll('.a4-page')
    pages.forEach((page) => observer.observe(page))

    return () => observer.disconnect()
  }, [numPages, containerRef, onPageChange])

  if (!fileData) {
    return null
  }

  const handleLoadSuccess = ({ numPages: pages }: { numPages: number }) => {
    setNumPages(pages)
    onLoadSuccess(pages)
  }

  return (
    <div ref={containerRef} className="pdf-container">
      <div className="pdf-viewer-wrapper">
        <Document
          file={fileData}
          onLoadSuccess={handleLoadSuccess}
          loading={
            <div className="pdf-loading">
              <div className="page-loading-spinner"></div>
              <span>Carregando PDF...</span>
            </div>
          }
          error={
            <div className="pdf-error">
              Erro ao carregar PDF
            </div>
          }
        >
          {Array.from(new Array(numPages), (_, index) => (
            <div key={`page_${index + 1}`} className="a4-page" data-page-number={index + 1}>
              <Page
                pageNumber={index + 1}
                scale={scale}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                loading={
                  <div className="page-loading-placeholder">
                    <div className="page-loading-spinner"></div>
                  </div>
                }
              />
            </div>
          ))}
        </Document>
      </div>
    </div>
  )
}

export default PdfViewer