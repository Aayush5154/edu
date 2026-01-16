import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import api from '../services/api'

function Playlists() {
  const { t } = useLanguage()
  const [playlists, setPlaylists] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [newPlaylist, setNewPlaylist] = useState({ title: '', description: '', is_public: false })
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    fetchPlaylists()
  }, [])

  const fetchPlaylists = async () => {
    try {
      const response = await api.get('/playlists/')
      setPlaylists(response.data.results || response.data || [])
    } catch (error) {
      console.error('Failed to fetch playlists:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePlaylist = async (e) => {
    e.preventDefault()
    setCreating(true)

    try {
      const response = await api.post('/playlists/', newPlaylist)
      setPlaylists([response.data, ...playlists])
      setShowModal(false)
      setNewPlaylist({ title: '', description: '', is_public: false })
    } catch (error) {
      console.error('Failed to create playlist:', error)
    } finally {
      setCreating(false)
    }
  }

  const handleDeletePlaylist = async (id, e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!confirm(t('deleteConfirm'))) return

    try {
      await api.delete(`/playlists/${id}/`)
      setPlaylists(playlists.filter(p => p.id !== id))
    } catch (error) {
      console.error('Failed to delete playlist:', error)
    }
  }

  if (loading) {
    return (
      <div>
        <div className="skeleton" style={{ width: '200px', height: '40px', marginBottom: '24px' }}></div>
        <div className="playlist-grid">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="skeleton" style={{ height: '220px' }}></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: 'var(--font-size-3xl)', marginBottom: '4px' }}>{t('myPlaylists')}</h1>
          <p style={{ color: 'var(--text-muted)' }}>{t('organizeContent')}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          ➕ {t('newPlaylist')}
        </button>
      </div>

      {playlists.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '64px' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>📚</div>
          <h3 style={{ marginBottom: '8px' }}>{t('noPlaylistsYet')}</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
            {t('createYourFirst')}
          </p>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            {t('createPlaylist')}
          </button>
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
              <div className="playlist-cover">
                {playlist.is_public ? '🌍' : '📚'}
              </div>
              <div className="playlist-info">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <h3 className="playlist-title">{playlist.title}</h3>
                  <button 
                    className="btn btn-ghost btn-icon btn-sm"
                    onClick={(e) => handleDeletePlaylist(playlist.id, e)}
                    style={{ opacity: 0.5 }}
                  >
                    🗑️
                  </button>
                </div>
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
                  {playlist.is_public && (
                    <>
                      <span>•</span>
                      <span className="badge badge-primary">{t('public')}</span>
                    </>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{t('createNewPlaylist')}</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleCreatePlaylist}>
              <div className="modal-body">
                <div className="input-group">
                  <label className="input-label">{t('title')}</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g., Python Basics"
                    value={newPlaylist.title}
                    onChange={(e) => setNewPlaylist({ ...newPlaylist, title: e.target.value })}
                    required
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">{t('descriptionOptional')}</label>
                  <textarea
                    className="input"
                    placeholder={t('whatWillYouLearn')}
                    rows={3}
                    value={newPlaylist.description}
                    onChange={(e) => setNewPlaylist({ ...newPlaylist, description: e.target.value })}
                    style={{ resize: 'none' }}
                  />
                </div>
                <div className="input-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={newPlaylist.is_public}
                      onChange={(e) => setNewPlaylist({ ...newPlaylist, is_public: e.target.checked })}
                    />
                    <span className="input-label" style={{ marginBottom: 0 }}>{t('makePublic')}</span>
                  </label>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  {t('cancel')}
                </button>
                <button type="submit" className="btn btn-primary" disabled={creating}>
                  {creating ? t('creating') : t('createPlaylist')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Playlists

