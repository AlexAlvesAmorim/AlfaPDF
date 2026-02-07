import { ReactNode } from 'react'
import logo from '../../renderer/assets/logo.png'
import '../../renderer/src/styles/layout.css'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <img
            src={logo}
            alt="PDF Reader"
            className="app-logo"
          />
        </div>
      </header>

      <main className="main-content">
        {children}
      </main>
    </div>
  )
}
