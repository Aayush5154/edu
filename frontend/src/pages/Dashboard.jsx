import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { Icons } from '../components/Icons'
import api from '../services/api'

function Dashboard() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const [stats, setStats] = useState(null)
  const [recentPlaylists, setRecentPlaylists] = useState([])
  const [streaks, setStreaks] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [statsRes, playlistsRes, streaksRes] = await Promise.all([
        api.get('/progress/stats/'),
        api.get('/playlists/'),
        api.get('/progress/streaks/')
      ])
      
      setStats(statsRes.data)
      setRecentPlaylists((playlistsRes.data.results || playlistsRes.data || []).slice(0, 4))
      setStreaks(streaksRes.data)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Get user's initial for avatar
  const getUserInitial = () => {
    return user?.username?.charAt(0).toUpperCase() || 'L'
  }

  if (loading) {
    return (
      <div>
        <div className="skeleton" style={{ width: '100%', height: '280px', borderRadius: 'var(--radius-2xl)', marginBottom: '24px' }}></div>
        <div className="stats-grid">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="skeleton" style={{ height: '140px' }}></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      {/* Modern Hero Section with 3D Avatar */}
      <div className="dashboard-hero">
        <div className="hero-content">
          <p className="hero-greeting">👋 {t('welcomeBack')}</p>
          <h1 className="hero-title">{user?.username || 'Learner'}!</h1>
          <p className="hero-subtitle">{t('continueJourney')}</p>
          
          <div className="hero-stats">
            <div className="hero-stat">
              <Icons.Flame className="hero-stat-icon" />
              <span className="hero-stat-value">{streaks?.current_streak || 0}</span>
              <span className="hero-stat-label">{t('daysLearning')}</span>
            </div>
            <div className="hero-stat">
              <Icons.Clock className="hero-stat-icon" />
              <span className="hero-stat-value">{stats?.total_time_minutes || 0}</span>
              <span className="hero-stat-label">{t('totalMinutes')}</span>
            </div>
          </div>
        </div>

        {/* 3D Floating Avatar */}
        <div className="avatar-3d-container">
          <div className="avatar-particle"></div>
          <div className="avatar-particle"></div>
          <div className="avatar-particle"></div>
          <div className="avatar-particle"></div>
          <div className="avatar-3d">
            <div className="avatar-3d-inner">
              {getUserInitial()}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card stagger-1">
          <div className="stat-icon">
            <Icons.Flame />
          </div>
          <div className="stat-label">{t('currentStreak')}</div>
          <div className="stat-value" style={{ color: 'var(--warning)' }}>
            {streaks?.current_streak || 0}
          </div>
          <div className="stat-change">{t('daysLearning')}</div>
        </div>

        <div className="stat-card stagger-2">
          <div className="stat-icon">
            <Icons.Clock />
          </div>
          <div className="stat-label">{t('timeLearned')}</div>
          <div className="stat-value">{stats?.total_time_minutes || 0}</div>
          <div className="stat-change">{t('totalMinutes')}</div>
        </div>

        <div className="stat-card stagger-3">
          <div className="stat-icon">
            <Icons.CheckCircle />
          </div>
          <div className="stat-label">{t('itemsCompleted')}</div>
          <div className="stat-value">{stats?.items_completed || 0}</div>
          <div className="stat-change">{t('learningItems')}</div>
        </div>

        <div className="stat-card stagger-4">
          <div className="stat-icon">
            <Icons.Playlist />
          </div>
          <div className="stat-label">{t('activePlaylists')}</div>
          <div className="stat-value">{recentPlaylists.length}</div>
          <div className="stat-change">{t('inProgress')}</div>
        </div>
      </div>

      {/* Recent Playlists */}
      <div style={{ marginTop: 'var(--spacing-2xl)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
          <h2 style={{ fontSize: 'var(--font-size-xl)' }}>{t('recentPlaylists')}</h2>
          <Link to="/playlists" className="btn btn-secondary btn-sm">
            {t('viewAll')}
            <Icons.ChevronRight size={16} />
          </Link>
        </div>

        {recentPlaylists.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-2xl)' }}>
            <div style={{ marginBottom: 'var(--spacing-md)' }}>
              <Icons.Playlist size={48} style={{ color: 'var(--text-muted)' }} />
            </div>
            <h3 style={{ marginBottom: 'var(--spacing-sm)' }}>{t('noPlaylistsYet')}</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--spacing-md)' }}>
              {t('createFirstPlaylist')}
            </p>
            <Link to="/playlists" className="btn btn-primary">
              <Icons.Plus size={16} />
              {t('createPlaylist')}
            </Link>
          </div>
        ) : (
          <div className="playlist-grid">
            {recentPlaylists.map((playlist, index) => (
              <Link 
                key={playlist.id}
                to={`/playlists/${playlist.id}`}
                className="playlist-card animate-fade-up"
                style={{ animationDelay: `${index * 0.1}s`, textDecoration: 'none' }}
              >
                <div className="playlist-cover" style={{
                  background: `linear-gradient(135deg, hsl(${(playlist.id * 40) % 360}, 70%, 85%), hsl(${(playlist.id * 40 + 40) % 360}, 70%, 75%))`
                }}>
                  <Icons.Book size={48} />
                </div>
                <div className="playlist-info">
                  <h3 className="playlist-title">{playlist.title}</h3>
                  {playlist.description && (
                    <p className="playlist-description">{playlist.description}</p>
                  )}
                  <div className="playlist-meta">
                    <span className="playlist-meta-item">
                      <Icons.Video size={14} />
                      {playlist.item_count || 0} {t('items')}
                    </span>
                    <span className="playlist-meta-item">
                      <Icons.Clock size={14} />
                      {playlist.total_duration || 0} {t('min')}
                    </span>
                  </div>
                  {playlist.progress !== undefined && (
                    <div className="playlist-progress">
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${playlist.progress || 0}%` }}></div>
                      </div>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div style={{ marginTop: 'var(--spacing-2xl)' }}>
        <h2 style={{ fontSize: 'var(--font-size-xl)', marginBottom: 'var(--spacing-lg)' }}>{t('quickActions')}</h2>
        <div style={{ display: 'flex', gap: 'var(--spacing-md)', flexWrap: 'wrap' }}>
          <Link to="/playlists" className="btn btn-primary">
            <Icons.Plus size={18} />
            {t('newPlaylist')}
          </Link>
          <Link to="/discover" className="btn btn-secondary">
            <Icons.Discover size={18} />
            {t('discoverContent')}
          </Link>
          <Link to="/analytics" className="btn btn-secondary">
            <Icons.Analytics size={18} />
            {t('viewAnalytics')}
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

