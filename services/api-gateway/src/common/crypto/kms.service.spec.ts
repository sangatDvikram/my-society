/**
 * KmsService unit tests
 *
 * Tests the local-dev key-loading path (loadFromEnv) by supplying a mock
 * ConfigService that returns controlled env-var values. The AWS KMS path is
 * not tested here — it is gated behind NODE_ENV=production and intentionally
 * throws until @aws-sdk/client-kms is integrated.
 */

import { ConfigService } from '@nestjs/config'
import { Test, type TestingModule } from '@nestjs/testing'

import { KmsService } from './kms.service'

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Generate a 32-byte (64 hex char) key string for tests */
function fakeHexKey(fill = 'ab'): string {
  return fill.repeat(32)
}

function buildConfigService(overrides: Record<string, string | undefined> = {}) {
  const defaults: Record<string, string> = {
    NODE_ENV:       'development',
    ENCRYPTION_DEK: fakeHexKey('aa'),
    HMAC_SECRET:    fakeHexKey('bb'),
  }
  const values = { ...defaults, ...overrides }

  return {
    get: jest.fn((key: string, fallback?: string) => values[key] ?? fallback),
    getOrThrow: jest.fn((key: string) => {
      if (values[key] === undefined) throw new Error(`Missing config key: ${key}`)
      return values[key]
    }),
  }
}

async function buildService(configOverrides?: Record<string, string | undefined>) {
  const mockConfig = buildConfigService(configOverrides)
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      KmsService,
      { provide: ConfigService, useValue: mockConfig },
    ],
  }).compile()

  const service = module.get<KmsService>(KmsService)
  await service.onModuleInit()
  return service
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('KmsService (local-dev path)', () => {
  it('loads the DEK as a 32-byte Buffer from a valid 64-char hex string', async () => {
    const service = await buildService()
    const dek = service.getDek()
    expect(Buffer.isBuffer(dek)).toBe(true)
    expect(dek.byteLength).toBe(32)
  })

  it('loads the HMAC secret as a 32-byte Buffer from a valid 64-char hex string', async () => {
    const service = await buildService()
    const hmac = service.getHmacSecret()
    expect(Buffer.isBuffer(hmac)).toBe(true)
    expect(hmac.byteLength).toBe(32)
  })

  it('DEK bytes match the hex env var', async () => {
    const dekHex = fakeHexKey('de')
    const service = await buildService({ ENCRYPTION_DEK: dekHex })
    expect(service.getDek().toString('hex')).toBe(dekHex)
  })

  it('HMAC secret bytes match the hex env var', async () => {
    const hmacHex = fakeHexKey('ff')
    const service = await buildService({ HMAC_SECRET: hmacHex })
    expect(service.getHmacSecret().toString('hex')).toBe(hmacHex)
  })

  it('throws when ENCRYPTION_DEK is missing', async () => {
    await expect(buildService({ ENCRYPTION_DEK: undefined })).rejects.toThrow(
      /ENCRYPTION_DEK/,
    )
  })

  it('throws when HMAC_SECRET is missing', async () => {
    await expect(buildService({ HMAC_SECRET: undefined })).rejects.toThrow(
      /HMAC_SECRET/,
    )
  })

  it('throws when ENCRYPTION_DEK is shorter than 64 hex chars', async () => {
    await expect(buildService({ ENCRYPTION_DEK: 'abcd' })).rejects.toThrow(
      /ENCRYPTION_DEK/,
    )
  })

  it('throws when HMAC_SECRET is shorter than 64 hex chars', async () => {
    await expect(buildService({ HMAC_SECRET: '0000' })).rejects.toThrow(
      /HMAC_SECRET/,
    )
  })
})

describe('KmsService (production path stub)', () => {
  it('throws "not yet implemented" when NODE_ENV=production', async () => {
    await expect(buildService({ NODE_ENV: 'production' })).rejects.toThrow(
      /not yet implemented/i,
    )
  })
})
