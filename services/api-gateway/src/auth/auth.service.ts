import { createHash, randomBytes } from 'crypto'

import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import Redis from 'ioredis'

import { AuthTokenPair, JwtPayload, UserRole } from '@society/shared-types'

import { OtpService } from './otp/otp.service'
import { SmsService } from './otp/sms.service'
import { TotpService } from './totp/totp.service'
import { PhoneCryptoService } from '../common/crypto/phone-crypto.service'

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)
  private readonly redis: Redis
  private readonly bcryptRounds = 10
  private readonly refreshTtl: number

  constructor(
    private readonly otpService: OtpService,
    private readonly smsService: SmsService,
    private readonly totpService: TotpService,
    private readonly phoneCrypto: PhoneCryptoService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.redis = new Redis(this.configService.get<string>('REDIS_URL', 'redis://localhost:6379'))
    // 30 days in seconds
    this.refreshTtl = 30 * 24 * 60 * 60
  }

  // ─── OTP ────────────────────────────────────────────────────────────────────

  async sendOtp(phone: string, role: UserRole): Promise<{ message: string }> {
    const phoneHash = this.phoneCrypto.hashPhone(phone)
    const otp = this.otpService.generateOtp()
    await this.otpService.storeOtp(phoneHash, otp)
    this.smsService.sendOtp(phone, otp)
    this.logger.log(`OTP sent for role=${role} hash=${phoneHash.slice(0, 8)}…`)
    return { message: 'OTP sent' }
  }

  async verifyOtp(phone: string, otp: string, role: UserRole): Promise<AuthTokenPair> {
    const phoneHash = this.phoneCrypto.hashPhone(phone)
    const valid = await this.otpService.validateOtp(phoneHash, otp)
    if (!valid) throw new UnauthorizedException('Invalid or expired OTP')

    // Build minimal JWT payload — societyId / flatId resolved from DB in future
    const payload: JwtPayload = {
      sub: phoneHash,
      role,
      societyId: '',
      iat: Math.floor(Date.now() / 1000),
      exp: 0,
    }

    return this.issueTokenPair(payload)
  }

  // ─── JWT ────────────────────────────────────────────────────────────────────

  async refreshTokens(refreshToken: string): Promise<AuthTokenPair> {
    const tokenHash = this.hashToken(refreshToken)
    const stored = await this.redis.get(`refresh:${tokenHash}`)
    if (!stored) throw new UnauthorizedException('Invalid or expired refresh token')

    const isMatch = await bcrypt.compare(refreshToken, stored)
    if (!isMatch) throw new UnauthorizedException('Refresh token mismatch')

    const payloadRaw = await this.redis.get(`refresh-payload:${tokenHash}`)
    if (!payloadRaw) throw new UnauthorizedException('Refresh payload missing')

    const payload = JSON.parse(payloadRaw) as JwtPayload

    // Rotate: delete old, issue new pair
    await this.redis.del(`refresh:${tokenHash}`)
    await this.redis.del(`refresh-payload:${tokenHash}`)
    return this.issueTokenPair(payload)
  }

  async revokeToken(refreshToken: string): Promise<void> {
    const tokenHash = this.hashToken(refreshToken)
    await this.redis.del(`refresh:${tokenHash}`)
    await this.redis.del(`refresh-payload:${tokenHash}`)
  }

  // ─── TOTP ───────────────────────────────────────────────────────────────────

  setupTotp(): { secret: string; otpauthUrl: string } {
    return this.totpService.generateSecret()
  }

  verifyTotp(secret: string, token: string): boolean {
    const valid = this.totpService.verifyToken(secret, token)
    if (!valid) throw new BadRequestException('Invalid TOTP token')
    return true
  }

  // ─── Helpers ────────────────────────────────────────────────────────────────

  private async issueTokenPair(payload: JwtPayload): Promise<AuthTokenPair> {
    const expiresIn = this.configService.get<string>('JWT_EXPIRES_IN', '15m')
    // JwtSignOptions.expiresIn expects branded StringValue from `ms` — string cast is runtime-safe
    const accessToken = this.jwtService.sign(
      payload as Parameters<typeof this.jwtService.sign>[0],
      { expiresIn } as Parameters<typeof this.jwtService.sign>[1],
    )

    const refreshToken = randomBytes(40).toString('hex')
    const tokenHash = this.hashToken(refreshToken)
    const hashedToken = await bcrypt.hash(refreshToken, this.bcryptRounds)

    await this.redis.set(`refresh:${tokenHash}`, hashedToken, 'EX', this.refreshTtl)
    await this.redis.set(
      `refresh-payload:${tokenHash}`,
      JSON.stringify(payload),
      'EX',
      this.refreshTtl,
    )

    return { accessToken, refreshToken }
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex')
  }
}
