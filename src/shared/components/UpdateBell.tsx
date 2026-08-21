import { useEffect, useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import NotificationsIcon from '@mui/icons-material/Notifications'
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive'
import DownloadIcon from '@mui/icons-material/Download'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import RefreshIcon from '@mui/icons-material/Refresh'
import CloseIcon from '@mui/icons-material/Close'
import MenuIcon from '@mui/icons-material/Menu'
import './UpdateBell.css'

type UpdateState = 'idle' | 'checking' | 'available' | 'downloading' | 'downloaded' | 'error'

interface UpdateInfo {
  version: string
  releaseNotes?: string
}

export default function UpdateBell() {
  const [state, setState] = useState<UpdateState>('idle')
  const [version, setVersion] = useState<string>('')
  const [percent, setPercent] = useState<number>(0)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [releaseNotes, setReleaseNotes] = useState<string>('')
  const [isOpen, setIsOpen] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)
  const bellRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 })

  useEffect(() => {
    const api = window.electronAPI
    if (!api) return

    api.onUpdateChecking(() => {
      setState('checking')
      setHasInteracted(false)
    })

    api.onUpdateAvailable((info: { version: string; releaseNotes?: unknown }) => {
      setVersion(info.version)
      setReleaseNotes((info.releaseNotes ?? '') as string)
      setState('available')
      setHasInteracted(false)
    })

    api.onUpdateNotAvailable(() => {
      if (!hasInteracted) {
        setState('idle')
      }
    })

    api.onUpdateProgress((progress: { percent: number }) => {
      setPercent(progress.percent)
      setState('downloading')
    })

    api.onUpdateDownloaded((info: UpdateInfo) => {
      setVersion(info.version)
      setState('downloaded')
    })

    api.onUpdateError((error: { message: string }) => {
      setErrorMessage(error.message)
      setState('error')
    })
  }, [hasInteracted])

  const updateDropdownPosition = () => {
    if (bellRef.current) {
      const rect = bellRef.current.getBoundingClientRect()
      setDropdownPosition({
        top: rect.bottom + 8,
        left: rect.right - 320 // align right edge with button right edge
      })
    }
  }

  useEffect(() => {
    if (isOpen) {
      updateDropdownPosition()
      window.addEventListener('scroll', updateDropdownPosition, true)
      window.addEventListener('resize', updateDropdownPosition)
      return () => {
        window.removeEventListener('scroll', updateDropdownPosition, true)
        window.removeEventListener('resize', updateDropdownPosition)
      }
    }
  }, [isOpen])

  const handleInstall = async () => {
    await window.electronAPI?.quitAndInstall()
    setIsOpen(false)
  }

  const handleDismiss = () => {
    setHasInteracted(true)
    setIsOpen(false)
    if (state === 'error') {
      setState('idle')
      setErrorMessage('')
    }
  }

  const handleCheckNow = async () => {
    setState('checking')
    await window.electronAPI?.checkForUpdates()
  }

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsOpen(!isOpen)
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        if (bellRef.current && !bellRef.current.contains(event.target as Node)) {
          setIsOpen(false)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const hasNotification = state !== 'idle' && state !== 'checking'

  return (
    <div className="update-bell-container">
      <button
        ref={bellRef}
        type="button"
        className={`update-bell-btn ${hasNotification ? 'has-notification' : ''} ${isOpen ? 'open' : ''}`}
        onClick={toggleDropdown}
        aria-label={hasNotification ? `Atualização: ${getStateLabel(state, version, percent, errorMessage)}` : 'Verificar atualizações'}
        title={hasNotification ? getStateLabel(state, version, percent, errorMessage) : 'Verificar atualizações'}
      >
        {state === 'downloading' ? (
          <DownloadIcon sx={{ fontSize: 20 }} />
        ) : state === 'downloaded' ? (
          <NotificationsActiveIcon sx={{ fontSize: 20 }} />
        ) : state === 'error' ? (
          <NotificationsActiveIcon sx={{ fontSize: 20 }} />
        ) : state === 'available' ? (
          <NotificationsActiveIcon sx={{ fontSize: 20 }} />
        ) : (
          <NotificationsIcon sx={{ fontSize: 20 }} />
        )}
        {hasNotification && (
          <span className="update-bell-badge" aria-hidden="true">
            {state === 'downloading' ? `${percent}%` : ''}
          </span>
        )}
      </button>

      {isOpen && createPortal(
        <div
          ref={dropdownRef}
          className="update-bell-dropdown"
          role="menu"
          style={{
            '--dropdown-top': `${dropdownPosition.top}px`,
            '--dropdown-left': `${dropdownPosition.left}px`,
          }}
        >
          <div className="update-bell-dropdown-header">
            <span className="update-bell-dropdown-title">Atualizações</span>
            {state !== 'idle' && state !== 'checking' && (
              <button
                className="update-bell-dropdown-close"
                onClick={handleDismiss}
                aria-label="Fechar"
              >
                <CloseIcon sx={{ fontSize: 18 }} />
              </button>
            )}
          </div>

          <div className="update-bell-dropdown-content">
            {state === 'checking' && (
              <div className="update-bell-status checking">
                <div className="update-bell-spinner" />
                <span>Verificando atualizações...</span>
              </div>
            )}

            {state === 'available' && (
              <div className="update-bell-status available">
                <DownloadIcon sx={{ fontSize: 24 }} />
                <div className="update-bell-status-text">
                  <strong>Nova versão {version} disponível</strong>
                  <span>Baixando em segundo plano...</span>
                </div>
                <div className="update-progress-bar">
                  <div className="update-progress-fill" style={{ width: `${percent}%` }} />
                </div>
                <span className="update-percent">{percent}%</span>
              </div>
            )}

            {state === 'downloading' && (
              <div className="update-bell-status downloading">
                <DownloadIcon sx={{ fontSize: 24 }} />
                <div className="update-bell-status-text">
                  <strong>Baixando atualização...</strong>
                </div>
                <div className="update-progress-bar">
                  <div className="update-progress-fill" style={{ width: `${percent}%` }} />
                </div>
                <span className="update-percent">{percent}%</span>
              </div>
            )}

            {state === 'downloaded' && (
              <div className="update-bell-status downloaded">
                <CheckCircleIcon sx={{ fontSize: 24 }} />
                <div className="update-bell-status-text">
                  <strong>Atualização {version} pronta!</strong>
                  <span>Clique para instalar e reiniciar.</span>
                  <span className="update-admin-note">Requer permissão de administrador</span>
                </div>
                <button className="update-bell-install-btn" onClick={handleInstall}>
                  <RefreshIcon sx={{ fontSize: 18 }} />
                  Instalar agora
                </button>
              </div>
            )}

            {state === 'error' && (
              <div className="update-bell-status error">
                <ErrorOutlineIcon sx={{ fontSize: 24 }} />
                <div className="update-bell-status-text">
                  <strong>Erro ao atualizar</strong>
                  <span>{errorMessage}</span>
                </div>
                <div className="update-bell-error-actions">
                  <button className="update-bell-retry-btn" onClick={handleCheckNow}>
                    <RefreshIcon sx={{ fontSize: 16 }} />
                    Tentar novamente
                  </button>
                  <button className="update-bell-dismiss-btn" onClick={handleDismiss}>
                    Fechar
                  </button>
                </div>
              </div>
            )}

            {state === 'idle' && (
              <div className="update-bell-status idle">
                <MenuIcon sx={{ fontSize: 24 }} />
                <div className="update-bell-status-text">
                  <strong>Nenhuma atualização disponível</strong>
                  <span>Você está na versão mais recente.</span>
                </div>
                <button className="update-bell-check-btn" onClick={handleCheckNow}>
                  <RefreshIcon sx={{ fontSize: 16 }} />
                  Verificar agora
                </button>
              </div>
            )}

            {releaseNotes && (state === 'available' || state === 'downloaded') && (
              <details className="update-bell-release-notes">
                <summary>Novidades desta versão</summary>
                <div className="update-bell-release-notes-content" dangerouslySetInnerHTML={{ __html: formatReleaseNotes(releaseNotes) }} />
              </details>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

function getStateLabel(state: UpdateState, version: string, percent: number, errorMessage: string): string {
  switch (state) {
    case 'available':
      return `Nova versão ${version} disponível`
    case 'downloading':
      return `Baixando atualização... ${percent}%`
    case 'downloaded':
      return `Atualização ${version} pronta para instalar`
    case 'error':
      return `Erro ao atualizar: ${errorMessage}`
    default:
      return 'Verificar atualizações'
  }
}

function formatReleaseNotes(notes: string): string {
  return notes
    .replace(/^###\s+(.+)$/gm, '<h4>$1</h4>')
    .replace(/^##\s+(.+)$/gm, '<h3>$1</h3>')
    .replace(/^#\s+(.+)$/gm, '<h2>$1</h2>')
    .replace(/^\*\s+(.+)$/gm, '<li>$1</li>')
    .replace(/^-\s+(.+)$/gm, '<li>$1</li>')
    .replace(/\n/g, '<br>')
    .replace(/(<li>.*<\/li>)/g, '<ul>$1</ul>')
    .replace(/<\/ul><br><ul>/g, '')
}