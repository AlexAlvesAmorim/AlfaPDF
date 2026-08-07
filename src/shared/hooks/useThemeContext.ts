import { useContext } from 'react'
import { ThemeContext } from './themeContextValue'
import type { ThemeMode, ThemeVariant } from './useTheme'

export interface UseThemeContextValue {
  mode: ThemeMode
  variant: ThemeVariant
  isDark: boolean
  isLight: boolean
  setMode: (mode: ThemeMode) => void
  setVariant: (variant: ThemeVariant) => void
  toggle: () => void
}

export function useThemeContext(): UseThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    throw new Error('useThemeContext deve ser usado dentro de um <ThemeProvider>')
  }
  return ctx
}
