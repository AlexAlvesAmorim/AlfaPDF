import { useEffect, useState } from 'react'
import DownloadIcon from '@mui/icons-material/Download'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import RefreshIcon from '@mui/icons-material/Refresh'
import CloseIcon from '@mui/icons-material/Close'

type UpdateState = 'idle' | 'checking' | 'available' | 'downloading' | 'downloaded' | 'error'

export default function UpdateNotifier() {
  const [state, setState] = useState<UpdateState>('idle')
  const [version, setVersion] = useState<string>('')
  const [percent, setPercent] = useState<number>(0)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const api = window.electronAPI
    if (!api) return

    api.onUpdateChecking(() => {
      setState('checking')
      setDismissed(false)
    })

    api.onUpdateAvailable((info) => {
      setVersion(info.version)
      setState('available')
    })

    api.onUpdateNotAvailable(() => {
      setState('idle')
    })

    api.onUpdateProgress((progress) => {
      setPercent(progress.percent)
      setState('downloading')
    })

    api.onUpdateDownloaded((info) => {
      setVersion(info.version)
      setState('downloaded')
    })

    api.onUpdateError((error) => {
      setErrorMessage(error.message)
      setState('error')
    })
  }, [])

  const handleInstall = async () => {
    await window.electronAPI?.quitAndInstall()
  }

  const handleDismiss = () => {
    setDismissed(true)
  }

  if (dismissed || state === 'idle' || state === 'checking') return null

  return (
    <div className="update-notifier" role="status" aria-live="polite">
      <div className="update-notifier-content">
        <div className="update-notifier-icon">
          {state === 'downloading' && <DownloadIcon sx={{ fontSize: 22 }} />}
          {state === 'downloaded' && <CheckCircleIcon sx={{ fontSize: 22 }} />}
          {state === 'error' && <ErrorOutlineIcon sx={{ fontSize: 22 }} />}
          {state === 'available' && <DownloadIcon sx={{ fontSize: 22 }} />}
        </div>

        <div className="update-notifier-text">
          {state === 'available' && (
            <>
              <strong>Nova versão {version} disponível!</strong>
              <span>Baixando em segundo plano...</span>
            </>
          )}

          {state === 'downloading' && (
            <>
              <strong>Baixando atualização...</strong>
              <div className="update-progress-bar">
                <div className="update-progress-fill" style={{ width: `${percent}%` }} />
              </div>
              <span>{percent}%</span>
            </>
          )}

          {state === 'downloaded' && (
            <>
              <strong>Atualização {version} pronta!</strong>
              <span>Clique para instalar e reiniciar.</span>
            </>
          )}

          {state === 'error' && (
            <>
              <strong>Erro ao atualizar</strong>
              <span>{errorMessage}</span>
            </>
          )}
        </div>

        <div className="update-notifier-actions">
          {state === 'downloaded' && (
            <button
              className="update-btn install"
              onClick={handleInstall}
              title="Instalar agora e reiniciar"
            >
              <RefreshIcon sx={{ fontSize: 18 }} />
              Instalar agora
            </button>
          )}
          <button
            className="update-btn dismiss"
            onClick={handleDismiss}
            title="Fechar"
            aria-label="Fechar notificação"
          >
            <CloseIcon sx={{ fontSize: 18 }} />
          </button>
        </div>
      </div>
    </div>
  )
}
