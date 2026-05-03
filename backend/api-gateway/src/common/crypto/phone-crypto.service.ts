import { Injectable } from '@nestjs/common'
import {
  createCipheriv,
  createDecipheriv,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from 'crypto'
import { KmsService } from './kms.service'

/**
 * PhoneCryptoService — Dual-column phone number encryption/hashing
 *
 * Implements the pattern required by the data model for all phone fields:
 *
 *   phone_hash      — HMAC-SHA256(normalised_phone, HMAC_SECRET)
 *                     Deterministic; used for DB lookups and unique constraints.
 *                     One-way: raw phone is not recoverable from this value alone.
 *
 *   phone_encrypted — AES-256-GCM(normalised_phone, DEK, random_IV)
 *                     Reversible; decrypted only for display or GDPR export.
 *                     Buffer layout: [IV(12 bytes)][AuthTag(16 bytes)][Ciphertext]
 *
 * Both cryptographic keys are provided by `KmsService` which handles env-based
 * loading for dev and AWS KMS Decrypt for production.
 *
 * @see PRD §5.1.3 — Dual-column phone storage
 * @see PRD §7.1   — E.164 normalisation and key rotation
 */
@Injectable()
export class PhoneCryptoService {
  private readonly algorithm = 'aes-256-gcm' as const
  /** GCM recommended IV length (96 bits) */
  private readonly ivLength = 12
  /** GCM auth-tag length (128 bits) */
  private readonly authTagLength = 16

  constructor(private readonly kmsService: KmsService) {}

  // ─── E.164 Normalisation ───────────────────────────────────────────────────

  /**
   * Normalise a raw phone string to E.164 format.
   * Strips whitespace and formatting characters, then ensures a `+` prefix.
   *
   * Examples:
   *   "98765 43210"    → "+919876543210"
   *   "09876543210"    → "+919876543210"
   *   "+919876543210"  → "+919876543210"
   *
   * For production, replace with `libphonenumber-js` `parsePhoneNumber()`.
   */
  normaliseE164(raw: string): string {
    const digits = raw.replace(/[\s\-().]/g, '')
    if (digits.startsWith('+')) return digits
    const stripped = digits.startsWith('0') ? digits.slice(1) : digits
    return `+91${stripped}`
  }

  // ─── Hashing ──────────────────────────────────────────────────────────────

  /**
   * Produce the HMAC-SHA256 hex digest used for deterministic DB lookups.
   *
   * @param rawPhone - raw phone string (any format)
   * @returns 64-character lowercase hex string
   */
  hashPhone(rawPhone: string): string {
    const normalised = this.normaliseE164(rawPhone)
    return createHmac('sha256', this.kmsService.getHmacSecret())
      .update(normalised, 'utf8')
      .digest('hex')
  }

  // ─── Encryption ───────────────────────────────────────────────────────────

  /**
   * Encrypt a phone number using AES-256-GCM.
   *
   * A fresh cryptographically-random 96-bit IV is generated for every call.
   * The returned Buffer has the layout:
   *   [IV (12 bytes)] [AuthTag (16 bytes)] [Ciphertext (variable)]
   *
   * Store this buffer directly in a BYTEA/blob column — never base64-encode for
   * storage as that would expand the field size unnecessarily.
   *
   * @param rawPhone - raw phone string (any format)
   * @returns Buffer containing IV + AuthTag + Ciphertext
   */
  encryptPhone(rawPhone: string): Buffer {
    const normalised = this.normaliseE164(rawPhone)
    const dek = this.kmsService.getDek()
    const iv = randomBytes(this.ivLength)

    const cipher = createCipheriv(this.algorithm, dek, iv, {
      authTagLength: this.authTagLength,
    })

    const encrypted = Buffer.concat([
      cipher.update(normalised, 'utf8'),
      cipher.final(),
    ])
    const authTag = cipher.getAuthTag()

    // Layout: [IV][AuthTag][Ciphertext]
    return Buffer.concat([iv, authTag, encrypted])
  }

  // ─── Decryption ───────────────────────────────────────────────────────────

  /**
   * Decrypt a buffer produced by `encryptPhone`.
   *
   * @param cipherBuffer - raw Buffer from the `phone_encrypted` DB column
   * @returns plaintext E.164 phone string
   * @throws Error if the auth-tag verification fails (tampered data)
   */
  decryptPhone(cipherBuffer: Buffer): string {
    const dek = this.kmsService.getDek()
    const iv = cipherBuffer.subarray(0, this.ivLength)
    const authTag = cipherBuffer.subarray(this.ivLength, this.ivLength + this.authTagLength)
    const ciphertext = cipherBuffer.subarray(this.ivLength + this.authTagLength)

    const decipher = createDecipheriv(this.algorithm, dek, iv, {
      authTagLength: this.authTagLength,
    })
    decipher.setAuthTag(authTag)

    return decipher.update(ciphertext) + decipher.final('utf8')
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  /**
   * Constant-time comparison of two HMAC hex strings.
   * Use this instead of `===` to prevent timing-oracle attacks.
   */
  compareHashes(a: string, b: string): boolean {
    if (a.length !== b.length) return false
    return timingSafeEqual(Buffer.from(a, 'hex'), Buffer.from(b, 'hex'))
  }
}
