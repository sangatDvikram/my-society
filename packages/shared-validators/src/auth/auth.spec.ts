/**
 * @society/shared-validators — Auth domain tests
 *
 * Covers:
 *   phoneSchema    — E.164 normalisation + validation
 *   sendOtpSchema  — phone + role combination
 *   verifyOtpSchema — phone + OTP code + role
 *   verifyTotpSchema — 6-digit TOTP code
 *   refreshTokenSchema / revokeTokenSchema — token string presence
 */

import { UserRole } from '@society/shared-types'
import {
  phoneSchema,
  refreshTokenSchema,
  revokeTokenSchema,
  sendOtpSchema,
  verifyOtpSchema,
  verifyTotpSchema,
} from './index'

// ── phoneSchema ───────────────────────────────────────────────────────────────

describe('phoneSchema', () => {
  describe('valid inputs', () => {
    it('passes an already-valid E.164 number unchanged', () => {
      expect(phoneSchema.parse('+919876543210')).toBe('+919876543210')
    })

    it('prepends +91 to a bare 10-digit Indian number', () => {
      expect(phoneSchema.parse('9876543210')).toBe('+919876543210')
    })

    it('strips a leading 0 before prepending +91', () => {
      expect(phoneSchema.parse('09876543210')).toBe('+919876543210')
    })

    it('strips spaces and hyphens before normalising', () => {
      expect(phoneSchema.parse('98765 43210')).toBe('+919876543210')
    })

    it('accepts international numbers with country code', () => {
      expect(phoneSchema.parse('+12025550123')).toBe('+12025550123')
    })
  })

  describe('invalid inputs', () => {
    it('rejects a string that is too short', () => {
      expect(() => phoneSchema.parse('12345')).toThrow()
    })

    it('rejects a string that is too long (> 20 chars)', () => {
      expect(() => phoneSchema.parse('+919876543210987654321')).toThrow()
    })

    it('rejects a non-E.164 result after normalisation', () => {
      // "+" followed by "0" is invalid E.164 (first digit must be non-zero)
      expect(() => phoneSchema.parse('+0123456789')).toThrow()
    })

    it('rejects an empty string', () => {
      expect(() => phoneSchema.parse('')).toThrow()
    })
  })
})

// ── sendOtpSchema ─────────────────────────────────────────────────────────────

describe('sendOtpSchema', () => {
  it('parses a valid phone + role object', () => {
    const result = sendOtpSchema.parse({ phone: '+919876543210', role: UserRole.OWNER })
    expect(result.phone).toBe('+919876543210')
    expect(result.role).toBe(UserRole.OWNER)
  })

  it('normalises the phone during parsing', () => {
    const result = sendOtpSchema.parse({ phone: '9876543210', role: UserRole.ADMIN })
    expect(result.phone).toBe('+919876543210')
  })

  it('rejects an invalid role string', () => {
    expect(() =>
      sendOtpSchema.parse({ phone: '+919876543210', role: 'INVALID_ROLE' }),
    ).toThrow()
  })

  it('rejects a missing role field', () => {
    expect(() => sendOtpSchema.parse({ phone: '+919876543210' })).toThrow()
  })

  it('accepts all valid UserRole values', () => {
    Object.values(UserRole).forEach((role) => {
      expect(() =>
        sendOtpSchema.parse({ phone: '+919876543210', role }),
      ).not.toThrow()
    })
  })
})

// ── verifyOtpSchema ───────────────────────────────────────────────────────────

describe('verifyOtpSchema', () => {
  const valid = { phone: '+919876543210', otp: '123456', role: UserRole.OWNER }

  it('parses a valid OTP verification request', () => {
    const result = verifyOtpSchema.parse(valid)
    expect(result.otp).toBe('123456')
  })

  it('rejects an OTP shorter than 6 digits', () => {
    expect(() => verifyOtpSchema.parse({ ...valid, otp: '12345' })).toThrow()
  })

  it('rejects an OTP longer than 6 digits', () => {
    expect(() => verifyOtpSchema.parse({ ...valid, otp: '1234567' })).toThrow()
  })

  it('rejects a non-numeric OTP', () => {
    expect(() => verifyOtpSchema.parse({ ...valid, otp: '12345a' })).toThrow()
  })
})

// ── verifyTotpSchema ──────────────────────────────────────────────────────────

describe('verifyTotpSchema', () => {
  it('parses a valid 6-digit TOTP code', () => {
    const result = verifyTotpSchema.parse({ totp: '654321' })
    expect(result.totp).toBe('654321')
  })

  it('rejects a TOTP with letters', () => {
    expect(() => verifyTotpSchema.parse({ totp: '12345a' })).toThrow()
  })

  it('rejects a TOTP that is not exactly 6 digits', () => {
    expect(() => verifyTotpSchema.parse({ totp: '12345' })).toThrow()
    expect(() => verifyTotpSchema.parse({ totp: '1234567' })).toThrow()
  })
})

// ── refreshTokenSchema / revokeTokenSchema ────────────────────────────────────

describe('refreshTokenSchema', () => {
  it('parses a non-empty refresh token', () => {
    const result = refreshTokenSchema.parse({ refreshToken: 'opaque-token-value' })
    expect(result.refreshToken).toBe('opaque-token-value')
  })

  it('rejects an empty refreshToken string', () => {
    expect(() => refreshTokenSchema.parse({ refreshToken: '' })).toThrow()
  })
})

describe('revokeTokenSchema', () => {
  it('parses a non-empty refresh token', () => {
    const result = revokeTokenSchema.parse({ refreshToken: 'opaque-token-value' })
    expect(result.refreshToken).toBe('opaque-token-value')
  })

  it('rejects an empty refreshToken string', () => {
    expect(() => revokeTokenSchema.parse({ refreshToken: '' })).toThrow()
  })
})
