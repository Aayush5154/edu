import { useState, useEffect } from 'react'
import { Bar, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { useLanguage } from '../context/LanguageContext'
import api from '../services/api'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

function Analytics() {
  const { t } = useLanguage()
  const [weeklyData, setWeeklyData] = useState(null)
  const [stats, setStats] = useState(null)
  const [streaks, setStreaks] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const [weeklyRes, statsRes, streaksRes] = await Promise.all([
        api.get('/progress/weekly/'),
        api.get('/progress/stats/'),
        api.get('/progress/streaks/')
      ])
      
      setWeeklyData(weeklyRes.data)
      setStats(statsRes.data)
      setStreaks(streaksRes.data)
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { weekday: 'short' })
  }

  const barChartData = weeklyData ? {
    labels: weeklyData.daily_breakdown?.map(d => formatDate(d.date)) || [],
    datasets: [
      {
        label: t('minutesLearned'),
        data: weeklyData.daily_breakdown?.map(d => d.minutes) || [],
        backgroundColor: 'rgba(79, 70, 229, 0.8)',
        borderRadius: 8,
      },
    ],
  } : null

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  }

  const doughnutData = stats?.playlist_progress ? {
    labels: stats.playlist_progress.map(p => p.title.slice(0, 20)),
    datasets: [
      {
        data: stats.playlist_progress.map(p => p.progress),
        backgroundColor: [
          'rgba(79, 70, 229, 0.8)',
          'rgba(129, 140, 248, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderWidth: 0,
      },
    ],
  } : null

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  }

  if (loading) {
    return (
      <div>
        <div className="skeleton" style={{ width: '200px', height: '40px', marginBottom: '24px' }}></div>
        <div className="stats-grid">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="skeleton" style={{ height: '100px' }}></div>
          ))}
        </div>
        <div className="skeleton" style={{ height: '300px', marginTop: '24px' }}></div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: 'var(--font-size-3xl)', marginBottom: '4px' }}>{t('analytics')}</h1>
        <p style={{ color: 'var(--text-muted)' }}>{t('trackProgress')}</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card stagger-1">
          <div className="stat-label">{t('thisWeek')}</div>
          <div className="stat-value">{weeklyData?.total_minutes || 0}</div>
          <div className="stat-change">{t('minutesLearned')}</div>
        </div>

        <div className="stat-card stagger-2">
          <div className="stat-label">{t('itemsCompleted')}</div>
          <div className="stat-value">{weeklyData?.items_completed || 0}</div>
          <div className="stat-change">{t('thisWeek')}</div>
        </div>

        <div className="stat-card stagger-3">
          <div className="stat-label">{t('currentStreak')}</div>
          <div className="stat-value" style={{ color: 'var(--warning)' }}>
            🔥 {streaks?.current_streak || 0}
          </div>
          <div className="stat-change">{t('days')}</div>
        </div>

        <div className="stat-card stagger-4">
          <div className="stat-label">{t('totalLearned')}</div>
          <div className="stat-value">{stats?.total_time_minutes || 0}</div>
          <div className="stat-change">{t('minutesAllTime')}</div>
        </div>
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginTop: '32px' }}>
        {/* Weekly Activity Chart */}
        <div className="card">
          <h3 style={{ marginBottom: '24px' }}>{t('weeklyActivity')}</h3>
          <div style={{ height: '300px' }}>
            {barChartData && barChartData.labels.length > 0 ? (
              <Bar data={barChartData} options={barChartOptions} />
            ) : (
              <div style={{ 
                height: '100%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: 'var(--text-muted)'
              }}>
                <p>{t('noActivityYet')}</p>
              </div>
            )}
          </div>
        </div>

        {/* Playlist Progress Chart */}
        <div className="card">
          <h3 style={{ marginBottom: '24px' }}>{t('playlistProgress')}</h3>
          <div style={{ height: '300px' }}>
            {doughnutData && doughnutData.labels.length > 0 ? (
              <Doughnut data={doughnutData} options={doughnutOptions} />
            ) : (
              <div style={{ 
                height: '100%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: 'var(--text-muted)'
              }}>
                <p>{t('noPlaylistProgress')}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Streak Calendar */}
      <div className="card" style={{ marginTop: '24px' }}>
        <h3 style={{ marginBottom: '24px' }}>{t('learningStreak')}</h3>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {streaks?.recent_activity?.slice(0, 30).reverse().map((day, index) => (
            <div
              key={index}
              title={`${day.date}: ${day.minutes_learned} ${t('min')}`}
              style={{
                width: '24px',
                height: '24px',
                borderRadius: 'var(--radius-sm)',
                background: day.minutes_learned > 0 
                  ? `rgba(79, 70, 229, ${Math.min(day.minutes_learned / 60, 1)})` 
                  : 'var(--bg-tertiary)',
                transition: 'transform 0.2s',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => e.target.style.transform = 'scale(1.2)'}
              onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
            />
          ))}
        </div>
        <p style={{ marginTop: '16px', fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
          {t('last30Days')}
        </p>
      </div>

      {/* Tips */}
      <div className="card" style={{ marginTop: '24px', background: 'var(--accent-light)' }}>
        <h3 style={{ marginBottom: '12px', color: 'var(--accent-primary)' }}>💡 {t('tip')}</h3>
        <p style={{ color: 'var(--accent-hover)' }}>
          {t('consistencyTip')}
        </p>
      </div>
    </div>
  )
}

export default Analytics

