interface Props {
  onOpenPdf: () => void
}

export function WelcomeScreen({ onOpenPdf }: Props) {
return (
  <div className="welcome-container">
    <h2 className="welcome-title">ALFA PDF Reader</h2>

    <button className="primary-button" onClick={onOpenPdf}>
      Abrir PDF
    </button>
  </div>
)
}
