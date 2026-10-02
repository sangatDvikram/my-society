import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { authenticator } from 'otplib'

@Injectable()
export class TotpService {
  constructor(private readonly configService: ConfigService) {
    authenticator.options = { window: 1 }
  }

  generateSecret(): { secret: string; otpauthUrl: string } {
    const secret = authenticator.generateSecret()
    const issuer = this.configService.get<string>('TOTP_ISSUER', 'SocietyApp')
    const otpauthUrl = authenticator.keyuri('super-admin', issuer, secret)
    return { secret, otpauthUrl }
  }

  verifyToken(secret: string, token: string): boolean {
    return authenticator.verify({ token, secret })
  }
}
