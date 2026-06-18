import { useCallback, useState } from 'react'
import type { ToastData, ToastType } from '../components/Toast'

export function useToast() {
  const [toasts, setToasts] = useState<ToastData[]>([])

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', duration?: number) => {
      const id = crypto.randomUUID()
      setToasts((prev) => [...prev, { id, message, type, duration }])
    },
    []
  )

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return { toasts, showToast, removeToast }
}
