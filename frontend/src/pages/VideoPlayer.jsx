import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../services/api'

function VideoPlayer() {
  const { playlistId, itemId } = useParams()
  const [playlist, setPlaylist] = useState(null)
  const [currentItem, setCurrentItem] = useState(null)
  const [notes, setNotes] = useState([])
  const [newNote, setNewNote] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const timeTracker = useRef(0)
  const intervalRef = useRef(null)

  useEffect(() => {
    fetchData()
    startTimeTracking()
    
    return () => {
      stopTimeTracking()
      saveProgress()
    }
  }, [playlistId, itemId])

  const fetchData = async () => {
    try {
      // Fetch playlist first
      const playlistRes = await api.get(`/playlists/${playlistId}/`)
      setPlaylist(playlistRes.data)
      const item = playlistRes.data.items?.find(i => i.id === parseInt(itemId))
      setCurrentItem(item)
      
      // Try to fetch notes separately (don't fail if this errors)
      try {
        const notesRes = await api.get(`/notes/?item_id=${itemId}`)
        setNotes(notesRes.data.results || notesRes.data || [])
      } catch (notesError) {
        console.log('No notes found or notes API failed:', notesError)
        setNotes([])
      }
    } catch (error) {
      console.error('Failed to fetch playlist:', error)
    } finally {
      setLoading(false)
    }
  }

  const startTimeTracking = () => {
    intervalRef.current = setInterval(() => {
      timeTracker.current += 10
    }, 10000) // Track every 10 seconds
  }

  const stopTimeTracking = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
  }

  const saveProgress = async (completed = false) => {
    try {
      await api.post('/progress/', {
        playlist_item_id: parseInt(itemId),
        time_spent_seconds: timeTracker.current,
        is_completed: completed
      })
    } catch (error) {
      console.error('Failed to save progress:', error)
    }
  }

  const handleMarkComplete = async () => {
    await saveProgress(true)
    // Refresh to show updated state
    window.location.reload()
  }

  const handleAddNote = async (e) => {
    e.preventDefault()
    if (!newNote.trim()) return

    setSaving(true)
    try {
      const response = await api.post('/notes/', {
        playlist_item_id: parseInt(itemId),
        content: newNote,
        timestamp_seconds: 0 // Could integrate with video timestamp
      })
      setNotes([response.data, ...notes])
      setNewNote('')
    } catch (error) {
      console.error('Failed to add note:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteNote = async (noteId) => {
    try {
      await api.delete(`/notes/${noteId}/`)
      setNotes(notes.filter(n => n.id !== noteId))
    } catch (error) {
      console.error('Failed to delete note:', error)
    }
  }

  const extractVideoId = (url) => {
    if (!url) return null
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/)
    return match ? match[1] : null
  }

  const getNextItem = () => {
    if (!playlist?.items || !currentItem) return null
    const currentIndex = playlist.items.findIndex(i => i.id === currentItem.id)
    return playlist.items[currentIndex + 1] || null
  }

  const getPrevItem = () => {
    if (!playlist?.items || !currentItem) return null
    const currentIndex = playlist.items.findIndex(i => i.id === currentItem.id)
    return playlist.items[currentIndex - 1] || null
  }

  if (loading) {
    return (
      <div className="video-container">
        <div>
          <div className="skeleton" style={{ aspectRatio: '16/9', marginBottom: '16px' }}></div>
          <div className="skeleton" style={{ height: '32px', width: '60%' }}></div>
        </div>
        <div className="skeleton" style={{ height: '400px' }}></div>
      </div>
    )
  }

  if (!currentItem) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
        <h3>Item not found</h3>
        <Link to={`/playlists/${playlistId}`} className="btn btn-primary" style={{ marginTop: '16px' }}>
          Back to Playlist
        </Link>
      </div>
    )
  }

  const videoId = extractVideoId(currentItem.url)
  const nextItem = getNextItem()
  const prevItem = getPrevItem()

  return (
    <div className="animate-fade-in">
      {/* Breadcrumb */}
      <Link 
        to={`/playlists/${playlistId}`} 
        style={{ 
          color: 'var(--text-muted)', 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '4px', 
          marginBottom: '16px' 
        }}
      >
        ← Back to {playlist?.title}
      </Link>

      <div className="video-container">
        {/* Main Video Area */}
        <div>
          {/* Video Player */}
          <div className="video-player">
            {videoId ? (
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?rel=0`}
                title={currentItem.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div style={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center', 
                justifyContent: 'center',
                background: 'var(--bg-tertiary)',
                color: 'var(--text-secondary)'
              }}>
                <p style={{ marginBottom: '16px' }}>External content</p>
                <a 
                  href={currentItem.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                >
                  Open in New Tab
                </a>
              </div>
            )}
          </div>

          {/* Video Info */}
          <div className="video-info">
            <h1 className="video-title">{currentItem.title}</h1>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <span className="badge badge-primary" style={{ textTransform: 'capitalize' }}>
                {currentItem.item_type}
              </span>
              {currentItem.duration_minutes > 0 && (
                <span style={{ color: 'var(--text-muted)' }}>
                  {currentItem.duration_minutes} minutes
                </span>
              )}
              
              <div style={{ flex: 1 }}></div>
              
              <button 
                className="btn btn-primary"
                onClick={handleMarkComplete}
              >
                ✓ Mark as Complete
              </button>
            </div>

            {currentItem.description && (
              <p style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>
                {currentItem.description}
              </p>
            )}
          </div>

          {/* Navigation */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            marginTop: '24px',
            paddingTop: '24px',
            borderTop: '1px solid var(--border-color)'
          }}>
            {prevItem ? (
              <Link 
                to={`/watch/${playlistId}/${prevItem.id}`}
                className="btn btn-secondary"
              >
                ← Previous: {prevItem.title.slice(0, 30)}...
              </Link>
            ) : <div />}
            
            {nextItem ? (
              <Link 
                to={`/watch/${playlistId}/${nextItem.id}`}
                className="btn btn-primary"
              >
                Next: {nextItem.title.slice(0, 30)}... →
              </Link>
            ) : (
              <Link 
                to={`/playlists/${playlistId}`}
                className="btn btn-primary"
              >
                Finish Playlist ✓
              </Link>
            )}
          </div>
        </div>

        {/* Notes Panel */}
        <div className="notes-panel">
          <div className="notes-header">
            <h3 style={{ fontSize: 'var(--font-size-lg)' }}>📝 Notes</h3>
          </div>

          <div className="notes-list">
            {notes.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                <p>No notes yet</p>
                <p style={{ fontSize: 'var(--font-size-sm)' }}>Add notes while watching</p>
              </div>
            ) : (
              notes.map(note => (
                <div key={note.id} className="note-item">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    {note.timestamp_seconds > 0 && (
                      <span className="note-timestamp">
                        {Math.floor(note.timestamp_seconds / 60)}:{String(note.timestamp_seconds % 60).padStart(2, '0')}
                      </span>
                    )}
                    <button 
                      className="btn btn-ghost btn-icon btn-sm"
                      onClick={() => handleDeleteNote(note.id)}
                      style={{ opacity: 0.5, marginLeft: 'auto' }}
                    >
                      ✕
                    </button>
                  </div>
                  <p className="note-content">{note.content}</p>
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                    {new Date(note.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>

          <form className="notes-input" onSubmit={handleAddNote}>
            <textarea
              className="notes-textarea"
              placeholder="Add a note..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
            />
            <button 
              type="submit"
              className="btn btn-primary btn-sm"
              style={{ marginTop: '8px', width: '100%' }}
              disabled={saving || !newNote.trim()}
            >
              {saving ? 'Saving...' : 'Add Note'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default VideoPlayer
