import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class KmsService implements OnModuleInit {
  private readonly logger = new Logger(KmsService.name)

  private dek!: Buffer
  private hmacSecret!: Buffer

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit(): Promise<void> {
    await this.loadKeys()
  }

  getDek(): Buffer {
    return this.dek
  }

  getHmacSecret(): Buffer {
    return this.hmacSecret
  }

  private async loadKeys(): Promise<void> {
    const nodeEnv = this.configService.get<string>('NODE_ENV', 'development')
    if (nodeEnv === 'production') {
      return Promise.reject(new Error('AWS KMS path not yet implemented — set NODE_ENV=development for local use'))
    }
    this.loadFromEnv()
    return Promise.resolve()
  }

  private loadFromEnv(): void {
    const dekHex = this.configService.get<string>('ENCRYPTION_DEK')
    const hmacHex = this.configService.get<string>('HMAC_SECRET')

    if (!dekHex || dekHex.length !== 64) {
      throw new Error('ENCRYPTION_DEK env var must be a 64-character hex string')
    }
    if (!hmacHex || hmacHex.length !== 64) {
      throw new Error('HMAC_SECRET env var must be a 64-character hex string')
    }

    this.dek = Buffer.from(dekHex, 'hex')
    this.hmacSecret = Buffer.from(hmacHex, 'hex')
    this.logger.log('Crypto keys loaded from environment')
  }
}
