import { useCallback, useEffect, useMemo, useState } from 'react'

export type ThemeMode = 'light' | 'dark'
export type ThemeVariant = 'day' | 'night'

export interface ThemeState {
  mode: ThemeMode
  variant: ThemeVariant
}

const STORAGE_KEY = 'alfa-pdf-theme'

function detectInitial(): ThemeState {
  if (typeof window === 'undefined') return { mode: 'dark', variant: 'night' }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored === 'light' || stored === 'dark') {
      return { mode: stored, variant: stored === 'light' ? 'day' : 'night' }
    }
  } catch {
    void 0
  }

  if (window.matchMedia?.('(prefers-color-scheme: light)').matches) {
    return { mode: 'light', variant: 'day' }
  }
  return { mode: 'dark', variant: 'night' }
}

function applyToDocument(state: ThemeState): void {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  root.setAttribute('data-theme', state.mode)
  root.setAttribute('data-mode', state.variant)
  root.style.colorScheme = state.mode
}

export function useTheme() {
  const [state, setState] = useState<ThemeState>(() => detectInitial())

  useEffect(() => {
    applyToDocument(state)
    try {
      window.localStorage.setItem(STORAGE_KEY, state.mode)
    } catch {
      void 0
    }
  }, [state])

  const setMode = useCallback((mode: ThemeMode) => {
    setState({ mode, variant: mode === 'light' ? 'day' : 'night' })
  }, [])

  const setVariant = useCallback((variant: ThemeVariant) => {
    setState((prev) => {
      const mode = variant === 'day' ? 'light' : 'dark'
      if (prev.mode === mode && prev.variant === variant) return prev
      return { mode, variant }
    })
  }, [])

  const toggle = useCallback(() => {
    setState((prev) =>
      prev.mode === 'dark'
        ? { mode: 'light', variant: 'day' }
        : { mode: 'dark', variant: 'night' }
    )
  }, [])

  return useMemo(
    () => ({
      ...state,
      isDark: state.mode === 'dark',
      isLight: state.mode === 'light',
      setMode,
      setVariant,
      toggle,
    }),
    [state, setMode, setVariant, toggle]
  )
}
