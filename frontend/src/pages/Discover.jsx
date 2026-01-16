import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import api from '../services/api'

function Discover() {
  const { t } = useLanguage()
  const [playlists, setPlaylists] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchPublicPlaylists()
  }, [])

  const fetchPublicPlaylists = async (searchQuery = '') => {
    setLoading(true)
    try {
      const url = searchQuery 
        ? `/playlists/discover/?search=${encodeURIComponent(searchQuery)}`
        : '/playlists/discover/'
      const response = await api.get(url)
      setPlaylists(response.data.results || response.data || [])
    } catch (error) {
      console.error('Failed to fetch playlists:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchPublicPlaylists(search)
  }

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: 'var(--font-size-3xl)', marginBottom: '4px' }}>{t('discover')}</h1>
        <p style={{ color: 'var(--text-muted)' }}>{t('explorePublic')}</p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <input
            type="text"
            className="input"
            placeholder={t('searchPlaylists')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: '400px' }}
          />
          <button type="submit" className="btn btn-primary">
            🔍 {t('search')}
          </button>
        </div>
      </form>

      {/* Featured Section */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: 'var(--font-size-xl)', marginBottom: '16px' }}>
          🌟 {t('featuredPlaylists')}
        </h2>
        
        {loading ? (
          <div className="playlist-grid">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="skeleton" style={{ height: '220px' }}></div>
            ))}
          </div>
        ) : playlists.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
            <h3 style={{ marginBottom: '8px' }}>{t('noPlaylistsFound')}</h3>
            <p style={{ color: 'var(--text-muted)' }}>
              {search ? t('tryDifferent') : t('beFirst')}
            </p>
          </div>
        ) : (
          <div className="playlist-grid">
            {playlists.map((playlist, index) => (
              <Link 
                key={playlist.id} 
                to={`/playlists/${playlist.id}`}
                className="playlist-card animate-fade-up"
                style={{ animationDelay: `${index * 0.05}s`, textDecoration: 'none' }}
              >
                <div className="playlist-cover" style={{ 
                  background: `linear-gradient(135deg, hsl(${(playlist.id * 50) % 360}, 70%, 85%), hsl(${(playlist.id * 50 + 40) % 360}, 70%, 75%))`
                }}>
                  🌍
                </div>
                <div className="playlist-info">
                  <h3 className="playlist-title">{playlist.title}</h3>
                  {playlist.description && (
                    <p style={{ 
                      color: 'var(--text-muted)', 
                      fontSize: 'var(--font-size-sm)',
                      marginTop: '4px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {playlist.description}
                    </p>
                  )}
                  <div className="playlist-meta" style={{ marginTop: '12px' }}>
                    <span>{playlist.item_count || 0} {t('items')}</span>
                    <span>•</span>
                    <span>{playlist.total_duration || 0} {t('min')}</span>
                  </div>
                  {playlist.creator && (
                    <div style={{ 
                      marginTop: '12px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px',
                      fontSize: 'var(--font-size-sm)',
                      color: 'var(--text-muted)'
                    }}>
                      <div className="avatar avatar-sm">
                        {playlist.creator.username?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <span>{t('by')} {playlist.creator.username}</span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Categories (static for now) */}
      <div>
        <h2 style={{ fontSize: 'var(--font-size-xl)', marginBottom: '16px' }}>
          📚 {t('browseCategory')}
        </h2>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {['Programming', 'Data Science', 'Web Development', 'Machine Learning', 'Design', 'Business'].map(category => (
            <button 
              key={category}
              className="btn btn-secondary"
              onClick={() => {
                setSearch(category)
                fetchPublicPlaylists(category)
              }}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Discover

