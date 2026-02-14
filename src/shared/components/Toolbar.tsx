import '../../renderer/src/styles/toolbar.css'

type ToolbarProps = {
  currentPage: number
  totalPages: number
  zoomPercentage: number
  onPrev(): void
  onNext(): void
  onFirstPage(): void
  onLastPage(): void
  onZoomIn(): void
  onZoomOut(): void
  onResetZoom(): void
  onPrint(): void
}

export function Toolbar({
  currentPage,
  totalPages,
  zoomPercentage,
  onPrev,
  onNext,
  onFirstPage,
  onLastPage,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onPrint,
}: ToolbarProps) {
  return (
    <div className="pdf-controls">
      {/* Navegação de páginas */}
      <div className="pdf-navigation">
        <button
        type="button"
          onClick={onPrev}
          disabled={currentPage <= 1 || totalPages === 0}
          className="pdf-control-btn"
          title="Página anterior (PageUp)"
        >
          ←
        </button>

        <span className="pdf-page-info">
          {totalPages > 0 ? `Página ${currentPage} de ${totalPages}` : 'Carregando...'}
        </span>

        <button
        type="button"
          onClick={onNext}
          disabled={currentPage >= totalPages || totalPages === 0}
          className="pdf-control-btn"
          title="Próxima página (PageDown)"
        >
          →
        </button>
      </div>

      {/* Controles de zoom */}
      <div className="pdf-zoom-controls">
        <button
          type="button"
          onClick={onZoomOut}
          disabled={totalPages === 0}
          className="pdf-control-btn"
          title="Diminuir zoom (Ctrl + -)"
        >
          −
        </button>

        <span className="pdf-zoom-info">
          {zoomPercentage}%
        </span>

        <button
          type="button"
          onClick={onZoomIn}
          disabled={totalPages === 0}
          className="pdf-control-btn"
          title="Aumentar zoom (Ctrl + +)"
        >
          +
        </button>

        <button
          type="button"
          onClick={onResetZoom}
          disabled={totalPages === 0}
          className="pdf-control-btn"
          title="Resetar zoom (Ctrl + 0)"
        >
          Reset
        </button>
      </div>

      {/* Botão de imprimir */}
      <div className="pdf-print-controls">
        <button
        type="button"
          onClick={onPrint}
          disabled={totalPages === 0}
          className="pdf-control-btn"
          title="Imprimir PDF (Ctrl+P)"
        >
          🖨️ Imprimir
        </button>
      </div>
    </div>
  )
}