/**
 * @society/shared-types — Auth domain tests
 *
 * Verifies that the exported enum values, interfaces, and structural contracts
 * match the canonical definitions used across backend services and frontend apps.
 */

import { AuthTokenPair, JwtPayload, OtpRecord, UserRole } from './index'

// ── UserRole enum ─────────────────────────────────────────────────────────────

describe('UserRole', () => {
  it('exports the five canonical role strings', () => {
    expect(UserRole.OWNER).toBe('OWNER')
    expect(UserRole.ADMIN).toBe('ADMIN')
    expect(UserRole.SUPER_ADMIN).toBe('SUPER_ADMIN')
    expect(UserRole.STAFF).toBe('STAFF')
    expect(UserRole.GUARD).toBe('GUARD')
  })

  it('has exactly five members', () => {
    const values = Object.values(UserRole)
    expect(values).toHaveLength(5)
  })

  it('contains only string values (not numeric)', () => {
    Object.values(UserRole).forEach((v) => expect(typeof v).toBe('string'))
  })
})

// ── JwtPayload interface ──────────────────────────────────────────────────────

describe('JwtPayload (structural)', () => {
  const now = Math.floor(Date.now() / 1000)

  const basePayload: JwtPayload = {
    sub:         'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
    role:        UserRole.OWNER,
    societyId:   '11111111-2222-3333-4444-555555555555',
    iat:         now,
    exp:         now + 900,
  }

  it('accepts a minimal payload without optional fields', () => {
    expect(basePayload.sub).toBeTruthy()
    expect(basePayload.role).toBe(UserRole.OWNER)
    expect(basePayload.societyId).toBeTruthy()
    expect(basePayload.flatId).toBeUndefined()
    expect(basePayload.totpVerified).toBeUndefined()
  })

  it('accepts a full SUPER_ADMIN payload with totpVerified', () => {
    const superAdminPayload: JwtPayload = {
      ...basePayload,
      role:          UserRole.SUPER_ADMIN,
      totpVerified:  true,
    }
    expect(superAdminPayload.totpVerified).toBe(true)
    expect(superAdminPayload.role).toBe(UserRole.SUPER_ADMIN)
  })

  it('accepts an OWNER payload with flatId', () => {
    const ownerPayload: JwtPayload = {
      ...basePayload,
      flatId: 'ffffffff-0000-1111-2222-333333333333',
    }
    expect(ownerPayload.flatId).toBe('ffffffff-0000-1111-2222-333333333333')
  })

  it('exp is greater than iat (token not yet expired)', () => {
    expect(basePayload.exp).toBeGreaterThan(basePayload.iat)
  })
})

// ── AuthTokenPair interface ───────────────────────────────────────────────────

describe('AuthTokenPair (structural)', () => {
  it('holds accessToken and refreshToken strings', () => {
    const pair: AuthTokenPair = {
      accessToken:  'eyJhbGciOiJIUzI1NiJ9.test.access',
      refreshToken: 'opaque-refresh-token-value',
    }
    expect(typeof pair.accessToken).toBe('string')
    expect(typeof pair.refreshToken).toBe('string')
    expect(pair.accessToken).not.toBe(pair.refreshToken)
  })
})

// ── OtpRecord interface ───────────────────────────────────────────────────────

describe('OtpRecord (structural)', () => {
  it('holds all required fields with correct types', () => {
    const record: OtpRecord = {
      phoneHash: 'abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
      otpHash:   '$2b$12$hashedOtpValue',
      role:      UserRole.OWNER,
      expiresAt: Math.floor(Date.now() / 1000) + 300,
    }
    expect(typeof record.phoneHash).toBe('string')
    expect(typeof record.otpHash).toBe('string')
    expect(Object.values(UserRole)).toContain(record.role)
    expect(record.expiresAt).toBeGreaterThan(0)
  })

  it('supports every valid UserRole in OtpRecord', () => {
    Object.values(UserRole).forEach((role) => {
      const record: OtpRecord = {
        phoneHash: 'hash',
        otpHash:   'bcrypt-hash',
        role,
        expiresAt: Date.now(),
      }
      expect(record.role).toBe(role)
    })
  })
})
