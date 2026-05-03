/**
 * @society/shared-types
 *
 * Root barrel export. All type contracts shared across backend services and
 * frontend applications live here.
 *
 * Import from the package root:
 *   import { UserRole, JwtPayload } from '@society/shared-types'
 *
 * Or from a sub-path (for tree-shaking in bundled apps):
 *   import { UserRole } from '@society/shared-types/auth'
 */

export * from './auth'
export * from './phone'
