import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name)

  constructor(private readonly configService: ConfigService) {}

  sendOtp(phone: string, otp: string): void {
    const env = this.configService.get<string>('NODE_ENV', 'development')

    if (env !== 'production') {
      this.logger.warn(`[DEV] OTP for ${phone}: ${otp}`)
      return
    }

    // TODO: wire production SMS provider (MSG91 / Twilio) via SMS_PROVIDER env var
    this.logger.warn(`SMS provider not configured for production. OTP not sent to ${phone}.`)
  }
}
