import logo from '../../renderer/assets/logo.png'

interface Props {
  onOpenPdf: () => void
}

export function WelcomeScreen({ onOpenPdf }: Props) {
  return (
    <div className="welcome-container">

      <img
        src={logo}
        alt="ALFA PDF Reader"
        className="welcome-logo"
      />

      <span className="welcome-eyebrow">
        ALFA PDF READER
      </span>

      <h1 className="welcome-title">
        Abra e imprima seus PDFs
      </h1>

      <p className="welcome-subtitle">
        Leitor profissional de PDF - OpenSource.
      </p>
      <p className="welcome-subtitle2">
        Desenvolvido por Alex A. Alves | <strong>Dev de Favela</strong>
      </p>
      <button
        className="welcome-open-button"
        onClick={onOpenPdf}
      >
        Abrir PDF
      </button>

      <div className="welcome-features">
        <div className="welcome-feature">
          <span className="welcome-feature__dot" />
          Impressão silenciosa
        </div>

        <div className="welcome-feature">
          <span className="welcome-feature__dot" />
          PDFs protegidos
        </div>

        <div className="welcome-feature">
          <span className="welcome-feature__dot" />
          Múltiplas abas
        </div>
      </div>

    </div>
  )
}