import { randomInt } from 'crypto'

import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as bcrypt from 'bcrypt'
import Redis from 'ioredis'

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name)
  private readonly redis: Redis
  private readonly ttl: number
  private readonly bcryptRounds = 10

  constructor(private readonly configService: ConfigService) {
    this.redis = new Redis(this.configService.get<string>('REDIS_URL', 'redis://localhost:6379'))
    this.ttl = this.configService.get<number>('OTP_TTL_SECONDS', 300)
  }

  generateOtp(): string {
    return randomInt(100000, 999999).toString()
  }

  async storeOtp(phoneHash: string, otp: string): Promise<void> {
    const hashed = await bcrypt.hash(otp, this.bcryptRounds)
    await this.redis.set(`otp:${phoneHash}`, hashed, 'EX', this.ttl)
    this.logger.log(`OTP stored for hash ${phoneHash.slice(0, 8)}…`)
  }

  async validateOtp(phoneHash: string, otp: string): Promise<boolean> {
    const hashed = await this.redis.get(`otp:${phoneHash}`)
    if (!hashed) return false
    const valid = await bcrypt.compare(otp, hashed)
    if (valid) {
      await this.redis.del(`otp:${phoneHash}`)
    }
    return valid
  }
}
