import { Document, Page } from 'react-pdf'
import {
  RefObject,
  useEffect,
  useState,
  useMemo,
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

  const isNavigating = useRef(false)
  const isInitialLoad = useRef(true)
  const prevPage = useRef(tab.currentPage)
  const prevZoom = useRef(tab.zoom)

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

  const fileData = useMemo(() => {
    if (!tab.data) return null
    return { data: tab.data }
  }, [tab.data])

  // ===============================
  // LOAD SUCCESS
  // ===============================

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

  // ===============================
  // RESTORE SCROLL WHEN CHANGING TAB
  // ===============================

  useEffect(() => {
    if (!containerRef.current) return
    containerRef.current.scrollTop = tab.scrollTop
  }, [tab.id])

  // ===============================
  // SCROLL PROGRAMÁTICO POR currentPage
  // ===============================

  useEffect(() => {
    if (!containerRef.current) return
    if (numPages === 0) return
    if (prevPage.current === tab.currentPage) return

    isNavigating.current = true
    prevPage.current = tab.currentPage

    const pageElement = containerRef.current.querySelector(
      `[data-page-number="${tab.currentPage}"]`
    ) as HTMLElement | null

    if (pageElement) {
      pageElement.scrollIntoView({
        behavior: 'auto',
        block: 'start'
      })
    }

    setTimeout(() => {
      isNavigating.current = false
    }, 200)
  }, [tab.currentPage, numPages, containerRef])

  // ===============================
  // BLOQUEIA OBSERVER DURANTE ZOOM
  // ===============================

  useEffect(() => {
    if (prevZoom.current !== tab.zoom) {
      isNavigating.current = true
      prevZoom.current = tab.zoom

      setTimeout(() => {
        isNavigating.current = false
      }, 200)
    }
  }, [tab.zoom])

  // ===============================
  // INTERSECTION OBSERVER
  // ===============================

  useEffect(() => {
    if (!containerRef.current) return
    if (numPages === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (isNavigating.current || isInitialLoad.current) return

        let visiblePage = tab.currentPage
        let maxRatio = 0

        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > maxRatio) {
            maxRatio = entry.intersectionRatio
            visiblePage = parseInt(
              entry.target.getAttribute('data-page-number') || '1',
              10
            )
          }
        })

        if (visiblePage !== tab.currentPage) {
          onTabUpdate({ currentPage: visiblePage })
        }
      },
      {
        root: containerRef.current,
        threshold: [0.5, 0.6, 0.7]
      }
    )

    const pages = containerRef.current.querySelectorAll('.a4-page')
    pages.forEach((page) => observer.observe(page))

    return () => observer.disconnect()
  }, [numPages, containerRef, onTabUpdate, tab.currentPage])

  // ===============================
  // PERSIST SCROLL
  // ===============================

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current

    const handleScroll = () => {
      if (isNavigating.current) return
      onTabUpdate({ scrollTop: container.scrollTop })
    }

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [containerRef, onTabUpdate])

  // ===============================
  // KEYBOARD SHORTCUTS
  // ===============================

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

  if (!fileData) {
    return (
      <div className="pdf-empty-state">
        <p>Nenhum PDF aberto</p>
        <p className="pdf-empty-hint">
          Faça upload de um arquivo para começar
        </p>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="pdf-container">
      <Document
        file={fileData}
        onLoadSuccess={handleLoadSuccess}
        loading={
          <div className="pdf-loading">
            <div className="page-loading-spinner" />
            <span>Carregando PDF...</span>
          </div>
        }
        error={<div className="pdf-error">Erro ao carregar PDF</div>}
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
                loading={
                  <div className="page-loading-placeholder">
                    <div className="page-loading-spinner" />
                  </div>
                }
              />
            </div>
          )
        })}
      </Document>
    </div>
  )
}

export default PdfViewer
