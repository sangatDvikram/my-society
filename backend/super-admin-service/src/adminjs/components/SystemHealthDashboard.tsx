import React from 'react'

interface Widget {
  label: string
  value: string | number
  unit?: string
  refreshing?: boolean
}

interface DashboardState {
  widgets: Widget[]
  loading: boolean
}

/**
 * SystemHealthDashboard — 6-widget real-time panel for the Super Admin dashboard.
 *
 * Widgets:
 *   1. Total Societies (ACTIVE)
 *   2. Total Users (non-deleted)
 *   3. Monthly Revenue
 *   4. Pending Audit Reports (DRAFT)
 *   5. Failed BullMQ Jobs (30-second poll)
 *   6. Active Feature Flags
 *
 * Section 16.6 of the PRD.
 */
const SystemHealthDashboard: React.FC = () => {
  const [state, setState] = React.useState<DashboardState>({ widgets: [], loading: true })

  const fetchStats = React.useCallback(async () => {
    try {
      const res = await fetch('/api/v1/admin/stats', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json() as {
          totalSocieties: number
          totalUsers: number
          monthlyRevenue: number
          pendingAudits: number
          failedJobs: number
          activeFlags: number
        }
        setState({
          loading: false,
          widgets: [
            { label: 'Total Societies',        value: data.totalSocieties },
            { label: 'Total Users',             value: data.totalUsers },
            { label: 'Monthly Revenue',         value: `₹${(data.monthlyRevenue / 100).toLocaleString()}` },
            { label: 'Pending Audit Reports',   value: data.pendingAudits },
            { label: 'Failed BullMQ Jobs',      value: data.failedJobs, refreshing: true },
            { label: 'Active Feature Flags',    value: data.activeFlags },
          ],
        })
      }
    } catch {
      setState(s => ({ ...s, loading: false }))
    }
  }, [])

  React.useEffect(() => {
    void fetchStats()
    const interval = setInterval(() => { void fetchStats() }, 30_000)
    return () => { clearInterval(interval) }
  }, [fetchStats])

  if (state.loading) {
    return <div style={{ padding: 24, color: '#888' }}>Loading dashboard…</div>
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, padding: 24 }}>
      {state.widgets.map(w => (
        <div
          key={w.label}
          style={{
            background: '#fff',
            borderRadius: 8,
            boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
            padding: '20px 24px',
          }}
        >
          <div style={{ fontSize: 12, color: '#666', marginBottom: 8, textTransform: 'uppercase' }}>
            {w.label}{w.refreshing ? ' ↻' : ''}
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#333' }}>
            {w.value}
          </div>
        </div>
      ))}
    </div>
  )
}

export default SystemHealthDashboard
