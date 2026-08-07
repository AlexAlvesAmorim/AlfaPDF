import '../../renderer/src/styles/toolbar.css'
import ZoomInIcon from "@mui/icons-material/ZoomIn"
import ZoomOutIcon from "@mui/icons-material/ZoomOut"
import RestartAltIcon from "@mui/icons-material/RestartAlt"
import PrintIcon from "@mui/icons-material/Print"
import TuneIcon from "@mui/icons-material/Tune"
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft"
import ChevronRightIcon from "@mui/icons-material/ChevronRight"
import UploadFileIcon from "@mui/icons-material/UploadFile"
import { ThemeToggle } from "./ThemeToggle"

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
  onPrintAdvanced(): void
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
  onPrintAdvanced,
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
          aria-label="Página anterior"
          title="Página anterior"
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
          aria-label="Próxima página"
          title="Próxima página"
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
          aria-label="Diminuir zoom"
          title="Diminuir zoom"
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
          aria-label="Aumentar zoom"
          title="Aumentar zoom"
        >
          <ZoomInIcon sx={{ fontSize: 20 }} />
        </button>

        <button
          type="button"
          onClick={onResetZoom}
          disabled={totalPages === 0}
          className="pdf-control-btn"
          aria-label="Restaurar zoom"
          title="Restaurar zoom (100%)"
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
          aria-label="Imprimir (Ctrl+P)"
          title="Imprimir (Ctrl+P)"
        >
          <PrintIcon sx={{ fontSize: 20 }} />
        </button>
        <button
          type="button"
          onClick={onPrintAdvanced}
          disabled={totalPages === 0}
          className="pdf-control-btn pdf-print-advanced"
          aria-label="Impressão avançada (diálogo do Windows)"
          title="Impressão avançada — diálogo do Windows"
        >
          <TuneIcon sx={{ fontSize: 20 }} />
        </button>
        <div className="pdf-file-controls">
          <button
            className="pdf-control-btn"
            type="button"
            onClick={() => {
              onOpenPdf()
            }}
            aria-label="Abrir PDF"
            title="Abrir PDF"
          >
            <UploadFileIcon sx={{ fontSize: 20 }} />
          </button>
        </div>
      </div>

      <div className="pdf-theme-controls">
        <ThemeToggle />
      </div>
    </div>

  )
}
