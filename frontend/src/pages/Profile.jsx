import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import api from '../services/api'

function Profile() {
  const { user, updateUser, logout } = useAuth()
  const { t } = useLanguage()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    username: user?.username || '',
    bio: user?.bio || ''
  })
  const [saving, setSaving] = useState(false)
  const [upgrading, setUpgrading] = useState(false)

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await api.patch('/auth/me/', form)
      updateUser(response.data)
      setEditing(false)
    } catch (error) {
      console.error('Failed to update profile:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleBecomeCreator = async () => {
    if (!confirm(t('creatorConfirm'))) return

    setUpgrading(true)
    try {
      const response = await api.post('/auth/become-creator/')
      updateUser(response.data.user)
    } catch (error) {
      console.error('Failed to upgrade:', error)
    } finally {
      setUpgrading(false)
    }
  }

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: 'var(--font-size-3xl)', marginBottom: '4px' }}>{t('profile')}</h1>
        <p style={{ color: 'var(--text-muted)' }}>{t('manageAccount')}</p>
      </div>

      <div style={{ maxWidth: '600px' }}>
        {/* Avatar Section */}
        <div className="card" style={{ textAlign: 'center', padding: '32px', marginBottom: '24px' }}>
          <div className="avatar avatar-lg" style={{ 
            width: '96px', 
            height: '96px', 
            fontSize: '36px',
            margin: '0 auto 16px'
          }}>
            {user?.username?.[0]?.toUpperCase() || 'U'}
          </div>
          <h2 style={{ marginBottom: '4px' }}>{user?.username}</h2>
          <p style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
          
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '16px' }}>
            <span className="badge badge-primary" style={{ textTransform: 'capitalize' }}>
              {user?.role || 'user'}
            </span>
            {user?.is_creator && (
              <span className="badge badge-success">✓ {t('creator')}</span>
            )}
          </div>
        </div>

        {/* Profile Info */}
        <div className="card" style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3>{t('profileInfo')}</h3>
            {!editing && (
              <button className="btn btn-secondary btn-sm" onClick={() => setEditing(true)}>
                {t('edit')}
              </button>
            )}
          </div>

          {editing ? (
            <form onSubmit={handleSave}>
              <div className="input-group">
                <label className="input-label">{t('username')}</label>
                <input
                  type="text"
                  className="input"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                />
              </div>
              <div className="input-group">
                <label className="input-label">{t('bio')}</label>
                <textarea
                  className="input"
                  rows={3}
                  placeholder={t('tellAboutYourself')}
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  style={{ resize: 'none' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? t('saving') : t('saveChanges')}
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => {
                    setEditing(false)
                    setForm({ username: user?.username || '', bio: user?.bio || '' })
                  }}
                >
                  {t('cancel')}
                </button>
              </div>
            </form>
          ) : (
            <div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>{t('username')}</label>
                <p style={{ fontWeight: 500 }}>{user?.username}</p>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>{t('email')}</label>
                <p style={{ fontWeight: 500 }}>{user?.email}</p>
              </div>
              <div>
                <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>{t('bio')}</label>
                <p style={{ fontWeight: 500 }}>{user?.bio || t('noBioYet')}</p>
              </div>
            </div>
          )}
        </div>

        {/* Creator Mode */}
        {!user?.is_creator && (
          <div className="card" style={{ marginBottom: '24px', background: 'linear-gradient(135deg, var(--accent-light), var(--bg-primary))' }}>
            <h3 style={{ marginBottom: '8px' }}>🚀 {t('becomeCreator')}</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
              {t('becomeCreatorDesc')}
            </p>
            <button 
              className="btn btn-primary"
              onClick={handleBecomeCreator}
              disabled={upgrading}
            >
              {upgrading ? t('upgrading') : t('upgradeToCreator')}
            </button>
          </div>
        )}

        {/* Account Stats */}
        <div className="card" style={{ marginBottom: '24px' }}>
          <h3 style={{ marginBottom: '16px' }}>{t('accountStats')}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>{t('memberSince')}</p>
              <p style={{ fontWeight: 600 }}>
                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            <div>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>{t('accountType')}</p>
              <p style={{ fontWeight: 600, textTransform: 'capitalize' }}>{user?.role || 'User'}</p>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="card" style={{ borderColor: 'var(--error)' }}>
          <h3 style={{ marginBottom: '16px', color: 'var(--error)' }}>{t('dangerZone')}</h3>
          <button 
            className="btn btn-secondary"
            style={{ borderColor: 'var(--error)', color: 'var(--error)' }}
            onClick={() => {
              if (confirm(t('logoutConfirm'))) {
                logout()
                window.location.href = '/login'
              }
            }}
          >
            {t('logOut')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Profile

