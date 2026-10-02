import {
  createCipheriv,
  createDecipheriv,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from 'crypto'

import { Injectable } from '@nestjs/common'

import { KmsService } from './kms.service'

@Injectable()
export class PhoneCryptoService {
  private readonly algorithm = 'aes-256-gcm' as const
  private readonly ivLength = 12
  private readonly authTagLength = 16

  constructor(private readonly kmsService: KmsService) {}

  normaliseE164(raw: string): string {
    const digits = raw.replace(/[\s\-().]/g, '')
    if (digits.startsWith('+')) return digits
    const stripped = digits.startsWith('0') ? digits.slice(1) : digits
    return `+91${stripped}`
  }

  hashPhone(rawPhone: string): string {
    const normalised = this.normaliseE164(rawPhone)
    return createHmac('sha256', this.kmsService.getHmacSecret())
      .update(normalised, 'utf8')
      .digest('hex')
  }

  encryptPhone(rawPhone: string): Buffer {
    const normalised = this.normaliseE164(rawPhone)
    const dek = this.kmsService.getDek()
    const iv = randomBytes(this.ivLength)

    const cipher = createCipheriv(this.algorithm, dek, iv, { authTagLength: this.authTagLength })
    const encrypted = Buffer.concat([cipher.update(normalised, 'utf8'), cipher.final()])
    const authTag = cipher.getAuthTag()

    return Buffer.concat([iv, authTag, encrypted])
  }

  decryptPhone(cipherBuffer: Buffer): string {
    const dek = this.kmsService.getDek()
    const iv = cipherBuffer.subarray(0, this.ivLength)
    const authTag = cipherBuffer.subarray(this.ivLength, this.ivLength + this.authTagLength)
    const ciphertext = cipherBuffer.subarray(this.ivLength + this.authTagLength)

    const decipher = createDecipheriv(this.algorithm, dek, iv, { authTagLength: this.authTagLength })
    decipher.setAuthTag(authTag)

    return decipher.update(ciphertext, undefined, 'utf8') + decipher.final('utf8')
  }

  compareHashes(a: string, b: string): boolean {
    if (a.length !== b.length) return false
    return timingSafeEqual(Buffer.from(a, 'hex'), Buffer.from(b, 'hex'))
  }
}
