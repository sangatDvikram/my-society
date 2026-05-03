import { AdminModule } from '@adminjs/nestjs'
import { Database, Resource } from '@adminjs/typeorm'
import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import AdminJS from 'adminjs'

import { buildAdminJsOptions } from './adminjs.options'

// Register the TypeORM adapter once at module load time
AdminJS.registerAdapter({ Database, Resource })

/**
 * AdminJSModule — sets up the Super Admin panel at /superadmin.
 *
 * Auth:    Email + password (TOTP enforced as a second step).
 * Session: Express-session; 8-hour TTL; HttpOnly/Secure/SameSite=Strict
 *
 * Section 16.1 / 16.4.1 / 16.7 of the PRD.
 */
@Module({
  imports: [
    AdminModule.createAdminAsync({
      useFactory: (configService: ConfigService) => buildAdminJsOptions(
        configService.getOrThrow<string>('ADMINJS_SESSION_SECRET'),
        configService.getOrThrow<string>('ADMINJS_COOKIE_SECRET'),
        configService.getOrThrow<string>('SUPER_ADMIN_EMAIL'),
        configService.getOrThrow<string>('SUPER_ADMIN_PASSWORD'),
      ),
      inject: [ConfigService],
    }),
  ],
})
export class AdminJSModule {}
