import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useLanguage } from '../context/LanguageContext'
import { Icons } from './Icons'

function Layout() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { t } = useLanguage()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const menuItems = [
    { path: '/', icon: Icons.Dashboard, labelKey: 'dashboard' },
    { path: '/playlists', icon: Icons.Playlist, labelKey: 'myPlaylists' },
    { path: '/analytics', icon: Icons.Analytics, labelKey: 'analytics' },
    { path: '/discover', icon: Icons.Discover, labelKey: 'discover' },
  ]

  return (
    <div className="app-layout">
      {/* Navbar */}
      <header className="navbar">
        <div className="navbar-brand">
          <Icons.Book size={28} />
          <span>EduFlex</span>
        </div>
        
        <div style={{ flex: 1 }} />
        
        <nav className="navbar-nav">
          {/* Streak Badge */}
          <div className="streak-badge">
            <Icons.Flame size={16} />
            <span>0 {t('days')}</span>
          </div>
          
          {/* Theme Toggle */}
          <button 
            className="theme-toggle" 
            onClick={toggleTheme}
            title={theme === 'light' ? t('switchToDark') : t('switchToLight')}
          >
            {theme === 'light' ? <Icons.Moon size={20} /> : <Icons.Sun size={20} />}
          </button>
          
          {/* User Avatar */}
          <div className="avatar">
            {user?.username?.[0]?.toUpperCase() || 'U'}
          </div>
        </nav>
      </header>

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-section">
          <div className="sidebar-section-title">{t('mainMenu')}</div>
          <ul className="sidebar-menu">
            {menuItems.map((item) => (
              <li key={item.path} className="sidebar-item">
                <NavLink 
                  to={item.path} 
                  className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                  end={item.path === '/'}
                >
                  <item.icon />
                  {t(item.labelKey)}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        <div style={{ marginTop: 'auto', paddingTop: 'var(--spacing-lg)', borderTop: '1px solid var(--border-color)' }}>
          <div className="sidebar-section-title">{t('account')}</div>
          <ul className="sidebar-menu">
            <li className="sidebar-item">
              <NavLink to="/profile" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <Icons.Profile />
                {t('profile')}
              </NavLink>
            </li>
            <li className="sidebar-item">
              <NavLink to="/settings" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <Icons.Settings />
                {t('settings')}
              </NavLink>
            </li>
            <li className="sidebar-item">
              <button 
                onClick={handleLogout}
                className="sidebar-link"
                style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left' }}
              >
                <Icons.Logout />
                {t('logout')}
              </button>
            </li>
          </ul>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout

