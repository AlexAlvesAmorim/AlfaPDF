import { useThemeContext } from '../hooks/useThemeContext'
import LightModeIcon from '@mui/icons-material/LightMode'
import DarkModeIcon from '@mui/icons-material/DarkMode'

interface ThemeToggleProps {
  className?: string
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { isDark, toggle } = useThemeContext()
  const label = isDark ? 'Ativar tema claro (diurno)' : 'Ativar tema escuro (noturno)'

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className={`pdf-control-btn pdf-theme-toggle ${className ?? ''}`}
    >
      {isDark ? (
        <DarkModeIcon className="pdf-theme-icon" sx={{ fontSize: 20 }} />
      ) : (
        <LightModeIcon className="pdf-theme-icon" sx={{ fontSize: 20 }} />
      )}
    </button>
  )
}

export default ThemeToggle