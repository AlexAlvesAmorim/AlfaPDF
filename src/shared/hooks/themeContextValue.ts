import { createContext } from 'react'
import type { UseThemeContextValue } from './useThemeContext'

export const ThemeContext = createContext<UseThemeContextValue | null>(null)
