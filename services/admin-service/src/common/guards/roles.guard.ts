import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Request } from 'express'

import { type JwtPayload, UserRole } from '@society/shared-types'

export const ROLES_KEY = 'roles'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    if (!required?.length) return true

    const req = context.switchToHttp().getRequest<Request & { user?: JwtPayload }>()
    const user = req.user
    if (!user || !required.includes(user.role)) {
      throw new ForbiddenException('Insufficient role')
    }

    // Cross-tenant guard
    const routeSocietyId = (req.params as Record<string, string>)['societyId']
    if (routeSocietyId && user.role !== UserRole.SUPER_ADMIN && user.societyId !== routeSocietyId) {
      throw new ForbiddenException('Cross-society access denied')
    }

    return true
  }
}
