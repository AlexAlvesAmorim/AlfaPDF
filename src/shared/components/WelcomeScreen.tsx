import logo from '../../renderer/assets/logo.png'

interface Props {
  onOpenPdf: () => void
}

export function WelcomeScreen({ onOpenPdf }: Props) {
  return (
    <div className="welcome-container">
      <div className="welcome-logo-wrapper">
        <img
          src={logo}
          alt="ALFA PDF Reader"
          className="welcome-logo"
        />
        <div className="welcome-logo-glow" />
      </div>

      <div className="welcome-brand">
        <h1 className="welcome-logo-name">ALFA PDF</h1>
        <span className="welcome-eyebrow">READER</span>
        <p className="welcome-subtitle">
          Leitura contínua, múltiplas abas, impressão silenciosa e suporte a senhas.
        </p>
      </div>

      <div className="welcome-actions">
        <button className="welcome-open-button" onClick={onOpenPdf}>
          <span className="welcome-open-button__icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </span>
          Abrir documento
        </button>
        <p className="welcome-hint">ou arraste um PDF para esta janela</p>
      </div>

      <div className="welcome-features">
        <div className="welcome-feature">
          <span className="welcome-feature__dot" />
          Impressão silenciosa
        </div>
        <div className="welcome-feature">
          <span className="welcome-feature__dot" />
          PDFs com senha
        </div>
        <div className="welcome-feature">
          <span className="welcome-feature__dot" />
          Múltiplas abas
        </div>
        <div className="welcome-feature">
          <span className="welcome-feature__dot" />
          Zoom + navegação
        </div>
      </div>

      <footer className="welcome-footer">
        <span className="welcome-footer__text">
          Desenvolvido por <strong>Alex A. Alves</strong>
        </span>
        <span className="welcome-footer__dot" />
        <span className="welcome-footer__version">v1.2.0</span>
      </footer>
    </div>
  )
}