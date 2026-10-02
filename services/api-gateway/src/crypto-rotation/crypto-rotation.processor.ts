import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Logger } from '@nestjs/common'
import { InjectDataSource } from '@nestjs/typeorm'
import { Job } from 'bullmq'
import { DataSource } from 'typeorm'

export const DEK_ROTATION_QUEUE = 'dek-rotation'
export const HMAC_ROTATION_QUEUE = 'hmac-rotation'

export interface DekRotationJobData {
  newDekHex: string
}

export interface HmacRotationJobData {
  newHmacSecretHex: string
}

@Processor(DEK_ROTATION_QUEUE)
export class DekRotationProcessor extends WorkerHost {
  private readonly logger = new Logger(DekRotationProcessor.name)
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {
    super()
  }

  async process(job: Job<DekRotationJobData>): Promise<void> {
    this.logger.log(`DEK rotation job ${job.id} started`)
    const { newDekHex } = job.data

    // Scaffold: real implementation would:
    // 1. Fetch users with phone_encrypted in batches of 1000
    // 2. Decrypt each with old DEK from KmsService
    // 3. Re-encrypt with new DEK from newDekHex
    // 4. Update row in a single transaction per batch
    // 5. Emit progress events via job.updateProgress()

    const totalRows = await this.dataSource
      .query<Array<{ count: string }>>('SELECT COUNT(*) as count FROM users WHERE phone_encrypted IS NOT NULL')
      .then((r) => parseInt(r[0]?.count ?? '0', 10))

    this.logger.log(`DEK rotation: ${totalRows} rows to process with newDekHex=${newDekHex.slice(0, 8)}…`)
    await job.updateProgress(0)

    // TODO: implement batch re-encryption when KmsService supports key switching
    this.logger.warn('DEK rotation batch re-encryption not yet implemented — scaffold only')
    await job.updateProgress(100)
    this.logger.log(`DEK rotation job ${job.id} completed (scaffold)`)
  }
}

@Processor(HMAC_ROTATION_QUEUE)
export class HmacRotationProcessor extends WorkerHost {
  private readonly logger = new Logger(HmacRotationProcessor.name)
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {
    super()
  }

  async process(job: Job<HmacRotationJobData>): Promise<void> {
    this.logger.log(`HMAC rotation job ${job.id} started`)
    const { newHmacSecretHex } = job.data

    // Scaffold: real implementation would:
    // 1. Fetch all phone_hash values in batches of 1000
    // 2. Dual-write: compute new hash with newHmacSecretHex alongside old hash
    // 3. Update new_phone_hash column in a transaction per batch
    // 4. After 100% coverage, rename columns and remove old hash

    const totalRows = await this.dataSource
      .query<Array<{ count: string }>>('SELECT COUNT(*) as count FROM users WHERE phone_hash IS NOT NULL')
      .then((r) => parseInt(r[0]?.count ?? '0', 10))

    this.logger.log(`HMAC rotation: ${totalRows} rows to process with secret=${newHmacSecretHex.slice(0, 8)}…`)
    await job.updateProgress(0)

    // TODO: implement dual-write batch re-hashing
    this.logger.warn('HMAC rotation batch re-hashing not yet implemented — scaffold only')
    await job.updateProgress(100)
    this.logger.log(`HMAC rotation job ${job.id} completed (scaffold)`)
  }
}
