/**
 * @society/shared-types — Auth domain
 *
 * Canonical type contracts for authentication, authorisation, and token
 * management. Consumed by every backend NestJS service and by the frontend
 * Next.js apps for typed API calls.
 */

// ─── Role Enumeration ─────────────────────────────────────────────────────────

/**
 * All roles recognised by the platform.
 *
 * | Role        | Scope                        | Auth factors             |
 * |-------------|------------------------------|--------------------------|
 * | OWNER       | single flat / unit           | Phone OTP                |
 * | ADMIN       | single society               | Phone OTP + PIN          |
 * | SUPER_ADMIN | global (all societies)       | Phone OTP + TOTP 2FA     |
 * | STAFF       | single society (sub-role)    | Phone OTP                |
 * | GUARD       | gate terminal (sub-role)     | Phone OTP                |
 */
export enum UserRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
  STAFF = 'STAFF',
  GUARD = 'GUARD',
}

// ─── JWT Payload ──────────────────────────────────────────────────────────────

/**
 * Shape of the decoded JWT payload used throughout the gateway and services.
 *
 * - `sub`        — user UUID (primary key in the `users` table)
 * - `role`       — one of `UserRole`
 * - `societyId`  — UUID of the user's society; used for row-level scope checks
 * - `flatId`     — UUID of the owner's flat; undefined for Admin / Super Admin
 * - `totpVerified` — true once the Super Admin has passed TOTP verification in
 *                    this session; defaults to false on initial OTP login
 * - `iat` / `exp` — standard JWT claims (issued-at / expiry, UNIX seconds)
 */
export interface JwtPayload {
  sub: string
  role: UserRole
  societyId: string
  flatId?: string
  totpVerified?: boolean
  iat: number
  exp: number
}

// ─── Token Pair ───────────────────────────────────────────────────────────────

/**
 * The response body returned by `POST /auth/otp/verify` and
 * `POST /auth/token/refresh`.
 *
 * - `accessToken`  — short-lived JWT (15 min); sent as `Authorization: Bearer`
 * - `refreshToken` — long-lived opaque token (30 days); stored server-side as
 *                    a bcrypt hash; used only at `POST /auth/token/refresh`
 */
export interface AuthTokenPair {
  accessToken: string
  refreshToken: string
}

// ─── OTP Meta ─────────────────────────────────────────────────────────────────

/**
 * Internal representation stored in Redis during OTP validation.
 * The `otpHash` is a bcrypt hash of the 6-digit code — never the plaintext OTP.
 */
export interface OtpRecord {
  phoneHash: string
  otpHash: string
  role: UserRole
  /** UNIX timestamp (seconds) at which this record expires */
  expiresAt: number
}
