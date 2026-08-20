import { useEffect, useState } from 'react'
import logo from '../../renderer/assets/logo.png'
import type { RecentFile } from '../types'

interface Props {
  onOpenPdf: () => void
  onOpenRecent: (filePath: string) => void
}

export function WelcomeScreen({ onOpenPdf, onOpenRecent }: Props) {
  const [version, setVersion] = useState('')
  const [recent, setRecent] = useState<RecentFile[]>([])

  useEffect(() => {
    window.electronAPI?.getAppVersion().then(v => setVersion(v))
    window.electronAPI?.getRecentDocuments().then(list => setRecent(list ?? []))
  }, [])

  const handleClearRecent = () => {
    window.electronAPI?.clearRecentDocuments().then(() => setRecent([]))
  }

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

      {recent.length > 0 && (
        <div className="welcome-recent">
          <div className="welcome-recent__header">
            <span>Recentes</span>
            <button className="welcome-recent__clear" onClick={handleClearRecent}>
              Limpar
            </button>
          </div>
          <ul className="welcome-recent__list">
            {recent.map((file) => (
              <li key={file.path}>
                <button
                  className="welcome-recent__item"
                  onClick={() => onOpenRecent(file.path)}
                  title={file.path}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  <span className="welcome-recent__name">{file.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

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
        <span className="welcome-footer__version">v{version}</span>
      </footer>
    </div>
  )
}