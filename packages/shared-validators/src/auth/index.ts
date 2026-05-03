/**
 * @society/shared-validators — Auth domain
 *
 * Zod schemas for all authentication request bodies.
 * Used by:
 *   - Backend NestJS services: validate incoming DTOs (via ZodValidationPipe)
 *   - Frontend Next.js apps: form validation before submitting
 *
 * All inferred TypeScript types are exported alongside their schemas.
 */

import { z } from 'zod'
import { UserRole } from '@society/shared-types'

// ─── E.164 Phone ─────────────────────────────────────────────────────────────

/**
 * Normalise a raw phone number to E.164 format.
 * Handles inputs such as:
 *   "9876543210"    → "+919876543210"  (Indian 10-digit, country code prepended)
 *   "+919876543210" → "+919876543210"  (already E.164)
 *   "09876543210"   → "+919876543210"  (leading 0 stripped, +91 prepended)
 *
 * For a production system integrate `libphonenumber-js` for robust parsing.
 * This transform covers the common Indian use case used in tests/dev.
 */
function normaliseE164(raw: string): string {
  const digits = raw.replace(/[\s\-().]/g, '')
  if (digits.startsWith('+')) return digits
  // Strip leading 0 and prepend +91 for Indian numbers
  const stripped = digits.startsWith('0') ? digits.slice(1) : digits
  return `+91${stripped}`
}

/**
 * Validates that a phone number, after normalisation, conforms to E.164.
 * E.164: `+` followed by 7–15 digits, first digit non-zero.
 *
 * `.transform(normaliseE164)` ensures the output is always a fully-qualified
 * E.164 string — callers never need to normalise themselves.
 */
export const phoneSchema = z
  .string()
  .min(7, 'Phone number too short')
  .max(20, 'Phone number too long')
  .transform(normaliseE164)
  .pipe(
    z
      .string()
      .regex(/^\+[1-9]\d{6,14}$/, 'Phone must be a valid E.164 number (e.g. +919876543210)'),
  )

export type PhoneInput = z.input<typeof phoneSchema>
export type E164PhoneOutput = z.output<typeof phoneSchema>

// ─── Send OTP ────────────────────────────────────────────────────────────────

/**
 * Request body for `POST /auth/otp/send`.
 *
 * The `role` field lets the gateway enforce role-specific rate limits and
 * route the OTP delivery through the correct channel.
 */
export const sendOtpSchema = z.object({
  phone: phoneSchema,
  role: z.nativeEnum(UserRole, {
    errorMap: () => ({ message: `role must be one of: ${Object.values(UserRole).join(', ')}` }),
  }),
})

export type SendOtpDto = z.infer<typeof sendOtpSchema>

// ─── Verify OTP ──────────────────────────────────────────────────────────────

/**
 * Request body for `POST /auth/otp/verify`.
 *
 * On success the gateway returns an `AuthTokenPair` (accessToken + refreshToken).
 */
export const verifyOtpSchema = z.object({
  phone: phoneSchema,
  otp: z
    .string()
    .length(6, 'OTP must be exactly 6 digits')
    .regex(/^\d+$/, 'OTP must contain digits only'),
  role: z.nativeEnum(UserRole),
})

export type VerifyOtpDto = z.infer<typeof verifyOtpSchema>

// ─── Refresh Token ────────────────────────────────────────────────────────────

/**
 * Request body for `POST /auth/token/refresh`.
 */
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'refreshToken is required'),
})

export type RefreshTokenDto = z.infer<typeof refreshTokenSchema>

// ─── Revoke Token ────────────────────────────────────────────────────────────

/**
 * Request body for `POST /auth/token/revoke` (logout).
 */
export const revokeTokenSchema = z.object({
  refreshToken: z.string().min(1, 'refreshToken is required'),
})

export type RevokeTokenDto = z.infer<typeof revokeTokenSchema>

// ─── Verify TOTP ─────────────────────────────────────────────────────────────

/**
 * Request body for `POST /auth/2fa/totp/verify`.
 * Accepts the 6-digit code shown in the authenticator app.
 */
export const verifyTotpSchema = z.object({
  totp: z
    .string()
    .length(6, 'TOTP must be exactly 6 digits')
    .regex(/^\d+$/, 'TOTP must contain digits only'),
})

export type VerifyTotpDto = z.infer<typeof verifyTotpSchema>
