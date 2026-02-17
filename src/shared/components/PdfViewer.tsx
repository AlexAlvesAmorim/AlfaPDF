import { Document, Page } from 'react-pdf'
import {
  RefObject,
  useEffect,
  useState,
  useRef,
  useCallback
} from 'react'
import '../../renderer/src/styles/pdfviewer.css'
import { PdfTab } from '../types/pdf'

interface PdfViewerProps {
  tab: PdfTab
  containerRef: RefObject<HTMLDivElement>
  onTabUpdate: (updates: Partial<Omit<PdfTab, 'id' | 'data'>>) => void
  onLoadSuccess?: (numPages: number) => void
}

function PdfViewer({
  tab,
  containerRef,
  onTabUpdate,
  onLoadSuccess
}: PdfViewerProps) {
  const [numPages, setNumPages] = useState(0)
  const [isDocked, setIsDocked] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  const isNavigating = useRef(false)
  const isInitialLoad = useRef(true)
  const prevPage = useRef(tab.currentPage)
  const prevZoom = useRef(tab.zoom)
  const prevTabId = useRef(tab.id)

  if (!tab) {
    return (
      <div className="pdf-empty-state">
        <p>Nenhum PDF aberto</p>
        <p className="pdf-empty-hint">
          Faça upload de um arquivo para começar
        </p>
      </div>
    )
  }

  useEffect(() => {
    if (prevTabId.current !== tab.id) {
      setNumPages(0)
      prevTabId.current = tab.id
      isInitialLoad.current = true
    }
  }, [tab.id])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 150)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleLoadSuccess = useCallback(
    ({ numPages: pages }: { numPages: number }) => {
      setNumPages(pages)

      isNavigating.current = true
      isInitialLoad.current = true

      if (containerRef.current) {
        containerRef.current.scrollTop = 0
      }

      prevPage.current = 1

      onTabUpdate({
        currentPage: 1,
        scrollTop: 0
      })

      setTimeout(() => {
        isNavigating.current = false
        isInitialLoad.current = false
      }, 300)

      onLoadSuccess?.(pages)
    },
    [containerRef, onLoadSuccess, onTabUpdate]
  )

  useEffect(() => {
    if (!containerRef.current) return
    containerRef.current.scrollTop = tab.scrollTop
  }, [tab.id, containerRef, tab.scrollTop])

  useEffect(() => {
    if (!containerRef.current || numPages === 0) return
    if (prevPage.current === tab.currentPage) return

    isNavigating.current = true
    prevPage.current = tab.currentPage

    const pageElement = containerRef.current.querySelector(
      `[data-page-number="${tab.currentPage}"]`
    ) as HTMLElement | null

    if (pageElement) {
      pageElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
    }

    setTimeout(() => {
      isNavigating.current = false
    }, 500)
  }, [tab.currentPage, numPages, containerRef])

  useEffect(() => {
    if (prevZoom.current !== tab.zoom) {
      isNavigating.current = true
      prevZoom.current = tab.zoom

      setTimeout(() => {
        isNavigating.current = false
      }, 200)
    }
  }, [tab.zoom])

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current

    const handleScroll = () => {
      if (!isNavigating.current) {
        onTabUpdate({ scrollTop: container.scrollTop })
      }

      const scrolled = container.scrollTop > 120
      setIsDocked(scrolled)
      setIsScrolled(scrolled)
    }

    container.addEventListener('scroll', handleScroll, { passive: true })
    return () => container.removeEventListener('scroll', handleScroll)
  }, [containerRef, onTabUpdate])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault()
        if (tab.currentPage < (tab.totalPages || 0)) {
          onTabUpdate({ currentPage: tab.currentPage + 1 })
        }
      }

      if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault()
        if (tab.currentPage > 1) {
          onTabUpdate({ currentPage: tab.currentPage - 1 })
        }
      }

      if (e.ctrlKey || e.metaKey) {
        if (e.key === '=' || e.key === '+') {
          e.preventDefault()
          onTabUpdate({ zoom: Math.min(tab.zoom * 1.2, 3) })
        }

        if (e.key === '-') {
          e.preventDefault()
          onTabUpdate({ zoom: Math.max(tab.zoom / 1.2, 0.5) })
        }

        if (e.key === '0') {
          e.preventDefault()
          onTabUpdate({ zoom: 1 })
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [tab.currentPage, tab.totalPages, tab.zoom, onTabUpdate])

  if (!tab.data) {
    return null
  }

  return (
    <>
      <div ref={containerRef} className="pdf-container">
        <Document
          file={tab.data}
          onLoadSuccess={handleLoadSuccess}
          onLoadError={() => {}}
          loading={
<div className="pdf-loading">
  <div className="pdf-progress-ring">
    <svg viewBox="0 0 100 100">
      <circle className="pdf-progress-bg" cx="50" cy="50" r="40" />
      <circle 
        className="pdf-progress-circle" 
        cx="50" cy="50" r="40" 
        strokeDasharray="251" 
        strokeDashoffset="0"
      />
    </svg>
  </div>
  <p className="pdf-loading-text">Carregando PDF...</p>
</div>
          }
          error={
            <div className="pdf-error">
              <p>Erro ao carregar PDF</p>
            </div>
          }
        >
          {Array.from({ length: numPages }, (_, index) => {
            const pageNumber = index + 1
            return (
              <div
                key={pageNumber}
                className="a4-page"
                data-page-number={pageNumber}
              >
                <Page
                  pageNumber={pageNumber}
                  scale={tab.zoom}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                />
              </div>
            )
          })}
        </Document>
      </div>
    </>
  )
}

export default PdfViewer