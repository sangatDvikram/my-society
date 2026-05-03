/**
 * @society/shared-validators
 *
 * Root barrel export. All Zod validation schemas shared across backend
 * services and frontend applications.
 *
 * Import from the package root:
 *   import { sendOtpSchema, SendOtpDto } from '@society/shared-validators'
 *
 * Or from a sub-path:
 *   import { phoneSchema } from '@society/shared-validators/auth'
 */

export * from './auth'
