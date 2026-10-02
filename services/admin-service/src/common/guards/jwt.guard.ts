import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { Request } from 'express'

import type { JwtPayload } from '@society/shared-types'

@Injectable()
export class JwtGuard {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request & { user?: JwtPayload }>()
    const token = this.extractBearer(request)
    if (!token) throw new UnauthorizedException('Missing Authorization header')

    try {
      const payload = this.jwtService.verify<JwtPayload>(token, {
        secret: this.configService.getOrThrow<string>('JWT_SECRET'),
      })
      request.user = payload
      return true
    } catch {
      throw new UnauthorizedException('Invalid or expired token')
    }
  }

  private extractBearer(req: Request): string | undefined {
    const auth = req.headers.authorization
    if (!auth?.startsWith('Bearer ')) return undefined
    return auth.slice(7)
  }
}
