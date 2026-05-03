import React from 'react'
import { ShowPropertyProps } from 'adminjs'

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  DRAFT:     { bg: '#E2E3E5', color: '#383D41' },
  UPCOMING:  { bg: '#CCE5FF', color: '#004085' },
  ONGOING:   { bg: '#D4EDDA', color: '#155724' },
  COMPLETED: { bg: '#D1ECF1', color: '#0C5460' },
  CANCELLED: { bg: '#F8D7DA', color: '#721C24' },
  REMOVED:   { bg: '#F5C6CB', color: '#491217' },
}

/**
 * EventStatusBadge — colour-coded chip for SocietyEvent status.
 * Section 16.5 of the PRD.
 */
const EventStatusBadge: React.FC<ShowPropertyProps> = ({ record }) => {
  const status: string = record?.params?.status ?? 'UNKNOWN'
  const style = STATUS_COLORS[status] ?? { bg: '#E2E3E5', color: '#383D41' }

  return (
    <span
      style={{
        background: style.bg,
        color: style.color,
        padding: '2px 8px',
        borderRadius: 12,
        fontSize: 12,
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
      }}
    >
      {status}
    </span>
  )
}

export default EventStatusBadge
