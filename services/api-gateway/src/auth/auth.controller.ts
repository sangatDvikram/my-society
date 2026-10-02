import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common'
import { Throttle } from '@nestjs/throttler'

import { type AuthTokenPair, UserRole } from '@society/shared-types'

import { AuthService } from './auth.service'
import { Roles } from './decorators/roles.decorator'
import { RefreshTokenDto } from './dto/refresh-token.dto'
import { SendOtpDto } from './dto/send-otp.dto'
import { VerifyOtpDto } from './dto/verify-otp.dto'
import { VerifyTotpDto } from './dto/verify-totp.dto'
import { JwtAuthGuard } from './guards/jwt-auth.guard'
import { RolesGuard } from './guards/roles.guard'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('otp/send')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 600_000 } })
  sendOtp(@Body() dto: SendOtpDto): Promise<{ message: string }> {
    return this.authService.sendOtp(dto.phone, dto.role)
  }

  @Post('otp/verify')
  @HttpCode(HttpStatus.OK)
  verifyOtp(@Body() dto: VerifyOtpDto): Promise<AuthTokenPair> {
    return this.authService.verifyOtp(dto.phone, dto.otp, dto.role)
  }

  @Post('token/refresh')
  @HttpCode(HttpStatus.OK)
  refreshToken(@Body() dto: RefreshTokenDto): Promise<AuthTokenPair> {
    return this.authService.refreshTokens(dto.refreshToken)
  }

  @Post('token/revoke')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  revokeToken(@Body() dto: RefreshTokenDto): Promise<void> {
    return this.authService.revokeToken(dto.refreshToken)
  }

  @Post('2fa/totp/setup')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  setupTotp(): { secret: string; otpauthUrl: string } {
    return this.authService.setupTotp()
  }

  @Post('2fa/totp/verify')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  verifyTotp(@Body() dto: VerifyTotpDto, @Body('secret') secret: string): { verified: boolean } {
    return { verified: this.authService.verifyTotp(secret, dto.totp) }
  }
}
