import { SetMetadata } from '@nestjs/common'

import type { UserRole } from '@society/shared-types'

export const ROLES_KEY = 'roles'
export const Roles = (...roles: UserRole[]): ReturnType<typeof SetMetadata> =>
  SetMetadata(ROLES_KEY, roles)
