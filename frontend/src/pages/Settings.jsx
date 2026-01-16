import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useLanguage } from '../context/LanguageContext'
import { Icons } from '../components/Icons'

function Settings() {
  const { user } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { language, setLanguage, t, availableLanguages } = useLanguage()
  const [notifications, setNotifications] = useState(true)
  const [offlineMode, setOfflineMode] = useState(false)

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: 'var(--spacing-xl)' }}>
        <h1 style={{ fontSize: 'var(--font-size-3xl)', marginBottom: 'var(--spacing-xs)' }}>{t('settingsTitle')}</h1>
        <p style={{ color: 'var(--text-muted)' }}>{t('customizeExperience')}</p>
      </div>

      <div style={{ maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
        
        {/* Appearance */}
        <div className="card card-static">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-lg)' }}>
            <Icons.Sun size={20} />
            <h3 style={{ fontSize: 'var(--font-size-lg)' }}>{t('appearance')}</h3>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--spacing-md) 0', borderBottom: '1px solid var(--border-color)' }}>
            <div>
              <p style={{ fontWeight: 500, marginBottom: '2px', color: 'var(--text-primary)' }}>{t('darkMode')}</p>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginBottom: 0 }}>{t('switchThemes')}</p>
            </div>
            <button 
              className={`btn ${theme === 'dark' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={toggleTheme}
            >
              {theme === 'dark' ? <Icons.Moon size={16} /> : <Icons.Sun size={16} />}
              {theme === 'dark' ? t('dark') : t('light')}
            </button>
          </div>
        </div>

        {/* Language */}
        <div className="card card-static">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-lg)' }}>
            <Icons.Globe size={20} />
            <h3 style={{ fontSize: 'var(--font-size-lg)' }}>{t('language')}</h3>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--spacing-md) 0' }}>
            <div>
              <p style={{ fontWeight: 500, marginBottom: '2px', color: 'var(--text-primary)' }}>{t('displayLanguage')}</p>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginBottom: 0 }}>{t('chooseLanguage')}</p>
            </div>
            <select 
              className="input" 
              style={{ width: 'auto' }}
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              {availableLanguages.map(lang => (
                <option key={lang.code} value={lang.code}>
                  {lang.nativeName} ({lang.name})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Offline & Sync */}
        <div className="card card-static">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-lg)' }}>
            <Icons.Download size={20} />
            <h3 style={{ fontSize: 'var(--font-size-lg)' }}>{t('offlineSync')}</h3>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--spacing-md) 0', borderBottom: '1px solid var(--border-color)' }}>
            <div>
              <p style={{ fontWeight: 500, marginBottom: '2px', color: 'var(--text-primary)' }}>{t('offlineMode')}</p>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginBottom: 0 }}>{t('enableOffline')}</p>
            </div>
            <button 
              className={`btn ${offlineMode ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setOfflineMode(!offlineMode)}
            >
              {offlineMode ? t('enabled') : t('disabled')}
            </button>
          </div>

          <div style={{ padding: 'var(--spacing-md) 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontWeight: 500, marginBottom: '2px', color: 'var(--text-primary)' }}>{t('autoSync')}</p>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginBottom: 0 }}>{t('autoSyncDesc')}</p>
              </div>
              <span className="badge badge-success">{t('active')}</span>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="card card-static">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-lg)' }}>
            <Icons.MessageCircle size={20} />
            <h3 style={{ fontSize: 'var(--font-size-lg)' }}>{t('notifications')}</h3>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--spacing-md) 0' }}>
            <div>
              <p style={{ fontWeight: 500, marginBottom: '2px', color: 'var(--text-primary)' }}>{t('learningReminders')}</p>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginBottom: 0 }}>{t('dailyReminders')}</p>
            </div>
            <button 
              className={`btn ${notifications ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setNotifications(!notifications)}
            >
              {notifications ? t('on') : t('off')}
            </button>
          </div>
        </div>

        {/* Data & Storage */}
        <div className="card card-static">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-lg)' }}>
            <Icons.Wifi size={20} />
            <h3 style={{ fontSize: 'var(--font-size-lg)' }}>{t('dataStorage')}</h3>
          </div>
          
          <div style={{ padding: 'var(--spacing-md) 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-sm)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>{t('cachedData')}</span>
              <span style={{ fontWeight: 500 }}>24.5 MB</span>
            </div>
            <div className="progress-bar" style={{ marginBottom: 'var(--spacing-md)' }}>
              <div className="progress-fill" style={{ width: '25%' }}></div>
            </div>
            <button className="btn btn-secondary btn-sm">{t('clearCache')}</button>
          </div>
        </div>

      </div>
    </div>
  )
}

export default Settings

