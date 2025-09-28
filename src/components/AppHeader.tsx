import type { FC } from 'react'

type AppHeaderProps = {
  theme: 'light' | 'dark'
  onToggleTheme: () => void
}

export const AppHeader: FC<AppHeaderProps> = ({ theme, onToggleTheme }) => {
  const isDark = theme === 'dark'

  return (
    <header className="app-header">
      <div className="app-header__group">
        <div className="app-header__title">
          <span className="app-header__icon" aria-hidden="true">
            🌐
          </span>
          <span className="app-header__title-text">Miku Web Tester</span>
        </div>
      </div>
      <button
        type="button"
        className="theme-toggle"
        onClick={onToggleTheme}
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      >
        <span className="theme-toggle__icon" aria-hidden="true">
          {isDark ? '🌙' : '☀️'}
        </span>
        <span className="theme-toggle__label">{isDark ? 'Dark' : 'Light'} mode</span>
      </button>
    </header>
  )
}
