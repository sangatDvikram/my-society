import React from 'react'
import { ShowPropertyProps } from 'adminjs'

/**
 * PhoneDisplay — renders a decrypted phone number in the admin panel.
 *
 * The raw `phoneEncrypted` ciphertext is masked server-side in the before()
 * hook and replaced with `phoneDecrypted` (plain E.164 string).
 * This component simply renders that pre-decrypted value.
 *
 * Section 16.5 of the PRD.
 */
const PhoneDisplay: React.FC<ShowPropertyProps> = ({ record }) => {
  const phone = record?.params?.phoneDecrypted ?? '••••••••••'
  return (
    <span
      style={{
        fontFamily: 'monospace',
        background: '#f4f4f4',
        padding: '2px 6px',
        borderRadius: 4,
        fontSize: 13,
      }}
    >
      {phone}
    </span>
  )
}

export default PhoneDisplay
