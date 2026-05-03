import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

/**
 * KmsService — Key Management abstraction
 *
 * Provides the two cryptographic keys needed by PhoneCryptoService:
 *   - **DEK** (Data Encryption Key)  — 32-byte AES-256 key for GCM encryption
 *   - **HMAC secret**                — 32-byte key for HMAC-SHA256 hashing
 *
 * ## Local Development (NODE_ENV !== 'production')
 * Keys are read directly from environment variables as 64-character hex strings:
 *   ENCRYPTION_DEK=<64 hex chars = 32 bytes>
 *   HMAC_SECRET=<64 hex chars = 32 bytes>
 *
 * ## Production
 * Keys are envelope-encrypted: the env vars hold the KMS-encrypted ciphertext.
 * On startup, `KmsService` calls AWS KMS `Decrypt` to obtain the plaintext DEK
 * and HMAC secret. The KMS Key ARN is supplied via `KMS_KEY_ARN`.
 *
 * This stub implements the local-dev path only.  The AWS KMS path is left as
 * an async method that can be swapped in without changing callers.
 */
@Injectable()
export class KmsService implements OnModuleInit {
  private readonly logger = new Logger(KmsService.name)

  private dek!: Buffer
  private hmacSecret!: Buffer

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit(): Promise<void> {
    await this.loadKeys()
  }

  // ─── Public API ─────────────────────────────────────────────────────────────

  /** Returns the 32-byte Data Encryption Key (AES-256). */
  getDek(): Buffer {
    return this.dek
  }

  /** Returns the 32-byte HMAC secret key. */
  getHmacSecret(): Buffer {
    return this.hmacSecret
  }

  // ─── Private ────────────────────────────────────────────────────────────────

  private async loadKeys(): Promise<void> {
    const nodeEnv = this.configService.get<string>('NODE_ENV', 'development')

    if (nodeEnv === 'production') {
      await this.loadFromKms()
    } else {
      this.loadFromEnv()
    }
  }

  /**
   * Local-dev path: reads 64-char hex strings from environment variables and
   * decodes them to 32-byte Buffers.  Throws on startup if either variable is
   * missing or malformed so misconfiguration is caught immediately.
   */
  private loadFromEnv(): void {
    const dekHex = this.configService.get<string>('ENCRYPTION_DEK')
    const hmacHex = this.configService.get<string>('HMAC_SECRET')

    if (!dekHex || dekHex.length !== 64) {
      throw new Error(
        'ENCRYPTION_DEK env var must be a 64-character hex string (32 bytes). ' +
          'Generate one with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"',
      )
    }
    if (!hmacHex || hmacHex.length !== 64) {
      throw new Error(
        'HMAC_SECRET env var must be a 64-character hex string (32 bytes). ' +
          'Generate one with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"',
      )
    }

    this.dek = Buffer.from(dekHex, 'hex')
    this.hmacSecret = Buffer.from(hmacHex, 'hex')
    this.logger.log('Crypto keys loaded from environment (local-dev mode)')
  }

  /**
   * Production path (AWS KMS).
   *
   * Expects the env vars `ENCRYPTION_DEK` and `HMAC_SECRET` to contain
   * base64-encoded KMS ciphertext blobs.  Calls `kms.decrypt()` to obtain
   * the plaintext keys.
   *
   * Requires: `KMS_KEY_ARN` env var and IAM permissions for `kms:Decrypt`.
   *
   * TODO: install `@aws-sdk/client-kms` and uncomment the implementation.
   */
  private async loadFromKms(): Promise<void> {
    // const { KMSClient, DecryptCommand } = await import('@aws-sdk/client-kms')
    // const kmsKeyArn = this.configService.getOrThrow<string>('KMS_KEY_ARN')
    // const client = new KMSClient({})
    //
    // const [dekResult, hmacResult] = await Promise.all([
    //   client.send(new DecryptCommand({
    //     CiphertextBlob: Buffer.from(this.configService.getOrThrow('ENCRYPTION_DEK'), 'base64'),
    //     KeyId: kmsKeyArn,
    //   })),
    //   client.send(new DecryptCommand({
    //     CiphertextBlob: Buffer.from(this.configService.getOrThrow('HMAC_SECRET'), 'base64'),
    //     KeyId: kmsKeyArn,
    //   })),
    // ])
    //
    // this.dek = Buffer.from(dekResult.Plaintext!)
    // this.hmacSecret = Buffer.from(hmacResult.Plaintext!)
    // this.logger.log('Crypto keys decrypted via AWS KMS')

    throw new Error('AWS KMS path not yet implemented — set NODE_ENV=development for local use')
  }
}
