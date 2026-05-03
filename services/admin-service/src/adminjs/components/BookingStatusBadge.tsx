import React from 'react'
import { ShowPropertyProps } from 'adminjs'

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  PENDING_APPROVAL: { bg: '#FFF3CD', color: '#856404' },
  APPROVED:         { bg: '#CCE5FF', color: '#004085' },
  CONFIRMED:        { bg: '#D4EDDA', color: '#155724' },
  REJECTED:         { bg: '#F8D7DA', color: '#721C24' },
  CANCELLED:        { bg: '#E2E3E5', color: '#383D41' },
}

/**
 * BookingStatusBadge — colour-coded chip for FacilityBooking status.
 * Section 16.5 of the PRD.
 */
const BookingStatusBadge: React.FC<ShowPropertyProps> = ({ record }) => {
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

export default BookingStatusBadge
