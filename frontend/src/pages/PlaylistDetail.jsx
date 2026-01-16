import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import api from '../services/api'

function PlaylistDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [playlist, setPlaylist] = useState(null)
  const [progress, setProgress] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newItem, setNewItem] = useState({ title: '', url: '', item_type: 'video', duration_minutes: 0 })
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    fetchPlaylistData()
  }, [id])

  const fetchPlaylistData = async () => {
    try {
      const [playlistRes, progressRes] = await Promise.all([
        api.get(`/playlists/${id}/`),
        api.get(`/progress/playlist/${id}/`)
      ])
      setPlaylist(playlistRes.data)
      setProgress(progressRes.data)
    } catch (error) {
      console.error('Failed to fetch playlist:', error)
      if (error.status === 404) {
        navigate('/playlists')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleAddItem = async (e) => {
    e.preventDefault()
    setAdding(true)

    try {
      const response = await api.post(`/playlists/${id}/items/`, newItem)
      setPlaylist({
        ...playlist,
        items: [...(playlist.items || []), response.data]
      })
      setShowAddModal(false)
      setNewItem({ title: '', url: '', item_type: 'video', duration_minutes: 0 })
    } catch (error) {
      console.error('Failed to add item:', error)
    } finally {
      setAdding(false)
    }
  }

  const handleDeleteItem = async (itemId) => {
    if (!confirm('Delete this item?')) return

    try {
      await api.delete(`/playlists/items/${itemId}/`)
      setPlaylist({
        ...playlist,
        items: playlist.items.filter(item => item.id !== itemId)
      })
    } catch (error) {
      console.error('Failed to delete item:', error)
    }
  }

  const getItemProgress = (itemId) => {
    if (!progress?.items) return null
    return progress.items.find(p => p.item_id === itemId)
  }

  const extractVideoId = (url) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/)
    return match ? match[1] : null
  }

  if (loading) {
    return (
      <div>
        <div className="skeleton" style={{ width: '200px', height: '32px', marginBottom: '16px' }}></div>
        <div className="skeleton" style={{ width: '100%', height: '200px', marginBottom: '24px' }}></div>
        <div className="skeleton" style={{ width: '100%', height: '60px', marginBottom: '8px' }}></div>
        <div className="skeleton" style={{ width: '100%', height: '60px' }}></div>
      </div>
    )
  }

  if (!playlist) {
    return <div>Playlist not found</div>
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <Link to="/playlists" style={{ color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '4px', marginBottom: '16px' }}>
          ← Back to Playlists
        </Link>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
          <div>
            <h1 style={{ fontSize: 'var(--font-size-3xl)', marginBottom: '8px' }}>{playlist.title}</h1>
            {playlist.description && (
              <p style={{ color: 'var(--text-muted)' }}>{playlist.description}</p>
            )}
            <div style={{ display: 'flex', gap: '16px', marginTop: '12px', color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>
              <span>{playlist.items?.length || 0} items</span>
              <span>•</span>
              <span>{playlist.total_duration || 0} min total</span>
              {playlist.is_public && (
                <>
                  <span>•</span>
                  <span className="badge badge-primary">Public</span>
                </>
              )}
            </div>
          </div>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            ➕ Add Content
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      {progress && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span className="font-medium">Your Progress</span>
            <span className="font-semibold" style={{ color: 'var(--accent-primary)' }}>
              {progress.progress_percentage}%
            </span>
          </div>
          <div className="progress-bar" style={{ height: '12px' }}>
            <div className="progress-fill" style={{ width: `${progress.progress_percentage}%` }}></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
            <span>{progress.completed_items} of {progress.total_items} completed</span>
            <span>{Math.floor(progress.total_time_spent / 60)} min spent</span>
          </div>
        </div>
      )}

      {/* Items List */}
      <div>
        <h2 style={{ fontSize: 'var(--font-size-xl)', marginBottom: '16px' }}>Content</h2>
        
        {(!playlist.items || playlist.items.length === 0) ? (
          <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📹</div>
            <h3 style={{ marginBottom: '8px' }}>No content yet</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
              Add videos, articles, or other learning resources
            </p>
            <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
              Add Your First Item
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {playlist.items.map((item, index) => {
              const itemProgress = getItemProgress(item.id)
              const videoId = extractVideoId(item.url)
              
              return (
                <div 
                  key={item.id}
                  className="card animate-fade-up"
                  style={{ 
                    animationDelay: `${index * 0.05}s`,
                    padding: '16px',
                    display: 'flex',
                    gap: '16px',
                    alignItems: 'center'
                  }}
                >
                  {/* Thumbnail */}
                  <div style={{ 
                    width: '120px', 
                    height: '68px', 
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    flexShrink: 0,
                    background: 'var(--bg-tertiary)'
                  }}>
                    {videoId ? (
                      <img 
                        src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                        alt={item.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{ 
                        width: '100%', 
                        height: '100%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        fontSize: '24px'
                      }}>
                        {item.item_type === 'video' ? '🎬' : item.item_type === 'article' ? '📄' : '📎'}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {itemProgress?.is_completed && (
                        <span style={{ color: 'var(--success)' }}>✓</span>
                      )}
                      <h4 style={{ fontSize: 'var(--font-size-base)', fontWeight: 500 }}>
                        {item.title}
                      </h4>
                    </div>
                    <div style={{ 
                      display: 'flex', 
                      gap: '12px', 
                      marginTop: '4px',
                      color: 'var(--text-muted)',
                      fontSize: 'var(--font-size-sm)'
                    }}>
                      <span className="badge badge-primary" style={{ textTransform: 'capitalize' }}>
                        {item.item_type}
                      </span>
                      {item.duration_minutes > 0 && (
                        <span>{item.duration_minutes} min</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Link 
                      to={`/watch/${playlist.id}/${item.id}`}
                      className="btn btn-primary btn-sm"
                    >
                      {itemProgress?.is_completed ? 'Rewatch' : 'Watch'}
                    </Link>
                    <button 
                      className="btn btn-ghost btn-icon btn-sm"
                      onClick={() => handleDeleteItem(item.id)}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Content</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowAddModal(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleAddItem}>
              <div className="modal-body">
                <div className="input-group">
                  <label className="input-label">Title</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g., Introduction to React"
                    value={newItem.title}
                    onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                    required
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">URL</label>
                  <input
                    type="url"
                    className="input"
                    placeholder="https://youtube.com/watch?v=..."
                    value={newItem.url}
                    onChange={(e) => setNewItem({ ...newItem, url: e.target.value })}
                    required
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Type</label>
                  <select
                    className="input"
                    value={newItem.item_type}
                    onChange={(e) => setNewItem({ ...newItem, item_type: e.target.value })}
                  >
                    <option value="video">Video</option>
                    <option value="article">Article</option>
                    <option value="resource">Resource</option>
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">Duration (minutes)</label>
                  <input
                    type="number"
                    className="input"
                    placeholder="10"
                    min="0"
                    value={newItem.duration_minutes}
                    onChange={(e) => setNewItem({ ...newItem, duration_minutes: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={adding}>
                  {adding ? 'Adding...' : 'Add Content'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default PlaylistDetail
