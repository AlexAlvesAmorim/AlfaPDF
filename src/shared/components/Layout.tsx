import { ReactNode } from 'react'
import logo from '../../renderer/assets/logo.png'
import '../../renderer/src/styles/layout.css'

interface LayoutProps {
  children: ReactNode
  hasOpenPdf?: boolean
  headerContent?: ReactNode
}

export function Layout({ children, hasOpenPdf, headerContent }: LayoutProps) {
  return (
    <div className="app-container">
      <header className={`app-header ${hasOpenPdf ? 'with-pdf' : ''}`}>
        <div className="header-content">
          <img src={logo} alt="PDF Reader" className="app-logo" />

          {hasOpenPdf && (
            <div className="header-right">
              {headerContent}
            </div>
          )}
        </div>
      </header>

      <main className="main-content">
        {children}
      </main>
    </div>
  )
}
