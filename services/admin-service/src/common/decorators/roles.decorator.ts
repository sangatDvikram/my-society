import { SetMetadata } from '@nestjs/common'

import { ROLES_KEY } from '../guards/roles.guard'

import type { UserRole } from '@society/shared-types'

export const Roles = (...roles: UserRole[]): ReturnType<typeof SetMetadata> =>
  SetMetadata(ROLES_KEY, roles)
