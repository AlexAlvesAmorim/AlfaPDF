import { Document, Page } from 'react-pdf'
import {
  RefObject,
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo
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
  const isProgrammaticScroll = useRef(false)
  const isInitialLoad = useRef(true)
  const prevPage = useRef(tab.currentPage)
  const prevZoom = useRef(tab.zoom)
  const prevTabId = useRef(tab.id)

  const documentOptions = useMemo(
    () => (tab.password ? { password: tab.password } : undefined),
    [tab.password]
  )

  useEffect(() => {
    if (prevTabId.current !== tab.id) {
      setNumPages(0)
      prevTabId.current = tab.id
      isInitialLoad.current = true
    }
  }, [tab.id])

  const handleLoadSuccess = useCallback(
    ({ numPages: pages }: { numPages: number }) => {
      setNumPages(pages)
      isNavigating.current = true
      isInitialLoad.current = true

      if (containerRef.current) {
        containerRef.current.scrollTop = 0
      }

      prevPage.current = 1
      onTabUpdate({ currentPage: 1, scrollTop: 0 })

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

  // Efeito de navegação por botão (Próxima/Anterior/Primeira/Última)
  useEffect(() => {
    if (!containerRef.current || numPages === 0) return
    if (prevPage.current === tab.currentPage) return

    // Se a mudança de página já veio do próprio scroll do mouse,
    // não faz scrollIntoView de novo — apenas sincroniza a referência.
    if (isProgrammaticScroll.current) {
      isProgrammaticScroll.current = false
      prevPage.current = tab.currentPage
      return
    }

    isNavigating.current = true
    prevPage.current = tab.currentPage

    const pageElement = containerRef.current.querySelector(
      `[data-page-number="${tab.currentPage}"]`
    ) as HTMLElement | null

    if (pageElement) {
      pageElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }

    setTimeout(() => {
      isNavigating.current = false
    }, 800)
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

        const pageElements = container.querySelectorAll('[data-page-number]')
        let currentVisible = 1

        pageElements.forEach((el) => {
          const rect = el.getBoundingClientRect()
          const containerRect = container.getBoundingClientRect()
          if (rect.top <= containerRect.top + containerRect.height / 2) {
            currentVisible = Number((el as HTMLElement).dataset.pageNumber)
          }
        })

        console.log('[SCROLL] visible:', currentVisible, 'prevPage.current:', prevPage.current, 'tab.currentPage:', tab.currentPage)

        if (currentVisible !== prevPage.current) {
          console.log('[SCROLL] CHAMANDO onTabUpdate com currentPage:', currentVisible)
          isProgrammaticScroll.current = true
          prevPage.current = currentVisible
          onTabUpdate({ currentPage: currentVisible })
        }
      } else {
        console.log('[SCROLL] BLOQUEADO — isNavigating é true')
      }
    }

    container.addEventListener('scroll', handleScroll, { passive: true })
    return () => container.removeEventListener('scroll', handleScroll)
  }, [containerRef, onTabUpdate])

  if (!tab?.data) {
    return null
  }

  return (
    <div ref={containerRef} className="pdf-container">
      <Document
        file={tab.url}
        options={documentOptions}
        onLoadSuccess={handleLoadSuccess}
        onLoadError={(err) => console.error('[PdfViewer] erro:', err)}
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
            <div key={pageNumber} className="a4-page" data-page-number={pageNumber}>
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
  )
}

export default PdfViewer