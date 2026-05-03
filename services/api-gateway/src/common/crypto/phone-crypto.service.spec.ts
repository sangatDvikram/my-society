import { type KmsService } from './kms.service'
import { PhoneCryptoService } from './phone-crypto.service'

/**
 * PhoneCryptoService — unit tests
 *
 * KmsService is mocked with a fixed 32-byte DEK and HMAC secret so tests are
 * deterministic and do not require AWS credentials or env vars.
 */

// Fixed 32-byte test keys (never use these in production)
const TEST_DEK = Buffer.alloc(32, 0xab)
const TEST_HMAC = Buffer.alloc(32, 0xcd)

function buildService(): PhoneCryptoService {
  const mockKms = {
    getDek: () => TEST_DEK,
    getHmacSecret: () => TEST_HMAC,
  } as unknown as KmsService

  return new PhoneCryptoService(mockKms)
}

describe('PhoneCryptoService', () => {
  let service: PhoneCryptoService

  beforeEach(() => {
    service = buildService()
  })

  // ─── normaliseE164 ─────────────────────────────────────────────────────────

  describe('normaliseE164()', () => {
    it('passes through an already-E164 number unchanged', () => {
      expect(service.normaliseE164('+919876543210')).toBe('+919876543210')
    })

    it('prepends +91 to a bare 10-digit Indian number', () => {
      expect(service.normaliseE164('9876543210')).toBe('+919876543210')
    })

    it('strips leading 0 before prepending +91', () => {
      expect(service.normaliseE164('09876543210')).toBe('+919876543210')
    })

    it('strips spaces and formatting characters', () => {
      expect(service.normaliseE164('+91 98765 43210')).toBe('+919876543210')
      expect(service.normaliseE164('+91-9876-543210')).toBe('+919876543210')
    })
  })

  // ─── hashPhone ─────────────────────────────────────────────────────────────

  describe('hashPhone()', () => {
    it('returns a 64-character lowercase hex string', () => {
      const hash = service.hashPhone('+919876543210')
      expect(hash).toHaveLength(64)
      expect(hash).toMatch(/^[0-9a-f]+$/)
    })

    it('is deterministic — same input always yields same hash', () => {
      const h1 = service.hashPhone('+919876543210')
      const h2 = service.hashPhone('+919876543210')
      expect(h1).toBe(h2)
    })

    it('normalises before hashing — different formats produce the same hash', () => {
      const h1 = service.hashPhone('+919876543210')
      const h2 = service.hashPhone('9876543210')
      const h3 = service.hashPhone('+91 98765 43210')
      expect(h1).toBe(h2)
      expect(h1).toBe(h3)
    })

    it('different phone numbers produce different hashes', () => {
      const h1 = service.hashPhone('+919876543210')
      const h2 = service.hashPhone('+919876543211')
      expect(h1).not.toBe(h2)
    })
  })

  // ─── encryptPhone / decryptPhone ───────────────────────────────────────────

  describe('encryptPhone() → decryptPhone()', () => {
    it('round-trips the normalised phone number', () => {
      const raw = '+919876543210'
      const cipherBuffer = service.encryptPhone(raw)
      const decrypted = service.decryptPhone(cipherBuffer)
      // decrypted should be the normalised E.164 form
      expect(decrypted).toBe(service.normaliseE164(raw))
    })

    it('each encryption call produces a different ciphertext (random IV)', () => {
      const raw = '+919876543210'
      const buf1 = service.encryptPhone(raw)
      const buf2 = service.encryptPhone(raw)
      // Both decrypt to the same value …
      expect(service.decryptPhone(buf1)).toBe(service.decryptPhone(buf2))
      // … but the raw bytes differ because the IV is random
      expect(buf1.equals(buf2)).toBe(false)
    })

    it('output buffer length = 12 (IV) + 16 (AuthTag) + ciphertext length', () => {
      const raw = '+919876543210'
      const normalised = service.normaliseE164(raw)
      const cipherBuffer = service.encryptPhone(raw)
      // AES-GCM ciphertext is the same length as the plaintext (no padding)
      expect(cipherBuffer.length).toBe(12 + 16 + Buffer.byteLength(normalised, 'utf8'))
    })

    it('throws when the auth tag has been tampered', () => {
      const cipherBuffer = service.encryptPhone('+919876543210')
      // Flip a byte in the auth-tag region (bytes 12–27)
      cipherBuffer[14] ^= 0xff
      expect(() => service.decryptPhone(cipherBuffer)).toThrow()
    })
  })

  // ─── compareHashes ─────────────────────────────────────────────────────────

  describe('compareHashes()', () => {
    it('returns true for identical hex strings', () => {
      const hash = service.hashPhone('+919876543210')
      expect(service.compareHashes(hash, hash)).toBe(true)
    })

    it('returns false for different hex strings', () => {
      const h1 = service.hashPhone('+919876543210')
      const h2 = service.hashPhone('+919876543211')
      expect(service.compareHashes(h1, h2)).toBe(false)
    })

    it('returns false when lengths differ', () => {
      const hash = service.hashPhone('+919876543210')
      expect(service.compareHashes(hash, hash.slice(0, 32))).toBe(false)
    })
  })
})
