interface Props {
  onOpenPdf: () => void
}

export function WelcomeScreen({ onOpenPdf }: Props) {
  return (
    <div className="welcome">
      <h2>PDF Reader</h2>
      <button onClick={onOpenPdf}>Abrir PDF</button>
    </div>
  )
}
