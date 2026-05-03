import React from 'react'
import SystemHealthDashboard from '../components/SystemHealthDashboard'

/**
 * DashboardComponent — custom AdminJS dashboard page for the Super Admin panel.
 *
 * Renders the SystemHealthDashboard with 6 real-time widgets.
 * Registered via adminJsOptions.dashboard.component in adminjs.options.ts.
 *
 * Section 16.6 of the PRD.
 */
const DashboardComponent: React.FC = () => (
  <div style={{ fontFamily: 'sans-serif' }}>
    <div
      style={{
        padding: '20px 24px 0',
        borderBottom: '1px solid #eee',
        marginBottom: 0,
      }}
    >
      <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: '#333' }}>
        System Health Overview
      </h2>
      <p style={{ margin: '4px 0 16px', fontSize: 13, color: '#888' }}>
        Real-time platform metrics — failed jobs refresh every 30 seconds
      </p>
    </div>
    <SystemHealthDashboard />
  </div>
)

export default DashboardComponent
