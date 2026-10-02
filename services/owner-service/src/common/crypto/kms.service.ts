import { Injectable, Logger, OnModuleInit } from '@nestjs/common'

@Injectable()
export class KmsService implements OnModuleInit {
  private readonly logger = new Logger(KmsService.name)

  private dek!: Buffer
  private hmacSecret!: Buffer

  async onModuleInit(): Promise<void> {
    const dekHex = process.env['ENCRYPTION_DEK']
    const hmacHex = process.env['HMAC_SECRET']

    if (!dekHex || dekHex.length !== 64) {
      throw new Error('ENCRYPTION_DEK env var must be a 64-character hex string')
    }
    if (!hmacHex || hmacHex.length !== 64) {
      throw new Error('HMAC_SECRET env var must be a 64-character hex string')
    }

    this.dek = Buffer.from(dekHex, 'hex')
    this.hmacSecret = Buffer.from(hmacHex, 'hex')
    this.logger.log('Crypto keys loaded from environment')
    return Promise.resolve()
  }

  getDek(): Buffer {
    return this.dek
  }

  getHmacSecret(): Buffer {
    return this.hmacSecret
  }
}
