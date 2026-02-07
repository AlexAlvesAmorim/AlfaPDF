type ToolbarProps = {
  currentPage: number;
  totalPages: number;
  onPrev(): void;
  onNext(): void;
  onZoomIn(): void;
  onZoomOut(): void;
  onResetZoom(): void;
  onPrint(): void;
};

export function Toolbar({
  currentPage,
  totalPages,
  onPrev,
  onNext,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onPrint,
}: ToolbarProps) {
  return (
    <div className="toolbar">
      <div className="toolbar-group">
        <button 
          className="toolbar-button" 
          onClick={onPrev} 
          disabled={currentPage <= 1}
          title="Página anterior (seta para cima)"
        >
          ↑ Anterior
        </button>
        
        <span className="page-indicator">
          {currentPage} / {totalPages}
        </span>
        
        <button 
          className="toolbar-button" 
          onClick={onNext} 
          disabled={currentPage >= totalPages}
          title="Próxima página (seta para baixo)"
        >
          Próxima ↓
        </button>
      </div>

      <div className="toolbar-group">
        <button 
          className="toolbar-button" 
          onClick={onZoomOut}
          title="Diminuir zoom (-)"
        >
          🔍 -
        </button>
        
        <button 
          className="toolbar-button" 
          onClick={onResetZoom}
          title="Resetar zoom (0)"
        >
          100%
        </button>
        
        <button 
          className="toolbar-button" 
          onClick={onZoomIn}
          title="Aumentar zoom (+)"
        >
          🔍 +
        </button>
      </div>

      <div className="toolbar-group">
        <button 
          className="toolbar-button" 
          onClick={onPrint}
          title="Imprimir PDF (Ctrl+P)"
        >
          🖨️ Imprimir
        </button>
      </div>
    </div>
  );
}