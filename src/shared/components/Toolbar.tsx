import '../../renderer/src/styles/toolbar.css'
import ZoomInIcon from "@mui/icons-material/ZoomIn"
import ZoomOutIcon from "@mui/icons-material/ZoomOut"
import RestartAltIcon from "@mui/icons-material/RestartAlt"
import PrintIcon from "@mui/icons-material/Print"
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft"
import ChevronRightIcon from "@mui/icons-material/ChevronRight"
import UploadFileIcon from "@mui/icons-material/UploadFile"

type ToolbarProps = {
  currentPage: number
  totalPages: number
  zoomPercentage: number
  isDocked: boolean
  isScrolled: boolean
  onPrev(): void
  onNext(): void
  onFirstPage(): void
  onLastPage(): void
  onZoomIn(): void
  onZoomOut(): void
  onResetZoom(): void
  onPrint(): void
  onOpenPdf(): void
}

export function Toolbar({
  currentPage,
  totalPages,
  zoomPercentage,
  isDocked,
  isScrolled,
  onPrev,
  onNext,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onPrint,
  onOpenPdf,
}: ToolbarProps) {
  return (
    <div className={`pdf-controls ${isScrolled ? "scrolled" : ""}`}>
      <div className="pdf-navigation">
        <button
          type="button"
          onClick={onPrev}
          disabled={currentPage <= 1 || totalPages === 0}
          className="pdf-control-btn"
        >
          <ChevronLeftIcon sx={{ fontSize: 22 }} />
        </button>

        {!isDocked && (
          <span className="pdf-page-info">
            {totalPages > 0
              ? `Página ${currentPage} de ${totalPages}`
              : 'Carregando...'}
          </span>
        )}

        <button
          type="button"
          onClick={onNext}
          disabled={currentPage >= totalPages || totalPages === 0}
          className="pdf-control-btn"
        >
          <ChevronRightIcon sx={{ fontSize: 22 }} />
        </button>
      </div>

      <div className="pdf-zoom-controls">
        <button
          type="button"
          onClick={onZoomOut}
          disabled={totalPages === 0}
          className="pdf-control-btn"
        >
          <ZoomOutIcon sx={{ fontSize: 20 }} />
        </button>

        {!isDocked && (
          <span className="pdf-zoom-info">
            {zoomPercentage}%
          </span>
        )}

        <button
          type="button"
          onClick={onZoomIn}
          disabled={totalPages === 0}
          className="pdf-control-btn"
        >
          <ZoomInIcon sx={{ fontSize: 20 }} />
        </button>

        <button
          type="button"
          onClick={onResetZoom}
          disabled={totalPages === 0}
          className="pdf-control-btn"
        >
          <RestartAltIcon sx={{ fontSize: 20 }} />
        </button>
      </div>

      <div className="pdf-print-controls">
        <button
          type="button"
          onClick={onPrint}
          disabled={totalPages === 0}
          className="pdf-control-btn"
        >
          <PrintIcon sx={{ fontSize: 20 }} />
        </button>
        <div className="pdf-file-controls">
          <button
            className="pdf-control-btn"
            type="button"
            onClick={() => {
              onOpenPdf()
            }}
          >
            <UploadFileIcon sx={{ fontSize: 20 }} />
          </button>
        </div>
      </div>
    </div>

  )
}
