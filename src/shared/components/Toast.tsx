import { useEffect, useRef } from 'react'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'

export type ToastType = 'success' | 'error' | 'info'

export interface ToastData {
  id: string
  message: string
  type: ToastType
  /** Duração em ms antes de fechar automaticamente. Padrão: 4000 */
  duration?: number
}

interface ToastItemProps {
  toast: ToastData
  onRemove: (id: string) => void
}

const ICONS: Record<ToastType, JSX.Element> = {
  success: <CheckCircleOutlineIcon sx={{ fontSize: 20 }} />,
  error:   <ErrorOutlineIcon       sx={{ fontSize: 20 }} />,
  info:    <InfoOutlinedIcon        sx={{ fontSize: 20 }} />,
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      onRemove(toast.id)
    }, toast.duration ?? 4000)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [toast.id, toast.duration, onRemove])

  return (
    <div
      className={`toast-item toast-${toast.type}`}
      role="alert"
      aria-live="polite"
      onClick={() => onRemove(toast.id)}
    >
      <span className="toast-icon">{ICONS[toast.type]}</span>
      <span className="toast-message">{toast.message}</span>
    </div>
  )
}

interface ToastContainerProps {
  toasts: ToastData[]
  onRemove: (id: string) => void
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (toasts.length === 0) return null

  return (
    <div className="toast-container" aria-label="Notificações">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>
  )
}
