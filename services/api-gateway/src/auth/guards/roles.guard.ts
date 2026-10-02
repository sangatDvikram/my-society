import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'

import { UserRole, JwtPayload } from '@society/shared-types'

import { ROLES_KEY } from '../decorators/roles.decorator'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (!requiredRoles || requiredRoles.length === 0) return true

    const request = context.switchToHttp().getRequest<{ user: JwtPayload; params: Record<string, string> }>()
    const user = request.user

    if (!user || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException('Insufficient role')
    }

    // Cross-tenant guard: if route has :societyId param, it must match JWT claim
    const routeSocietyId = request.params['societyId']
    if (routeSocietyId && user.role !== UserRole.SUPER_ADMIN && user.societyId !== routeSocietyId) {
      throw new ForbiddenException('Cross-society access denied')
    }

    return true
  }
}
