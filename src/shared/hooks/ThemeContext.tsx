import { type ReactNode } from 'react'
import { useTheme } from './useTheme'
import { ThemeContext } from './themeContextValue'

export function ThemeProvider({ children }: { children: ReactNode }) {
  const value = useTheme()
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
