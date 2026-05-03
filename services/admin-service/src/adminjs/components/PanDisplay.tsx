import React from 'react'
import { ShowPropertyProps } from 'adminjs'

/**
 * PanDisplay — renders a masked PAN using only panLast4.
 *
 * The full PAN is never decrypted in the admin panel (only masked last-4).
 * Section 16.5 (custom component) of the PRD.
 */
const PanDisplay: React.FC<ShowPropertyProps> = ({ record }) => {
  const last4 = record?.params?.panLast4 ?? '????'
  return (
    <span
      style={{
        fontFamily: 'monospace',
        background: '#f4f4f4',
        padding: '2px 6px',
        borderRadius: 4,
        fontSize: 13,
        letterSpacing: 2,
      }}
    >
      {'XXXXX' + last4}
    </span>
  )
}

export default PanDisplay
