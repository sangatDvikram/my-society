import { AdminModule } from '@adminjs/nestjs'
import { Database, Resource } from '@adminjs/typeorm'
import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import AdminJS from 'adminjs'

import { buildAdminJsOptions } from './adminjs.options'

// Register the TypeORM adapter once at module load time
AdminJS.registerAdapter({ Database, Resource })

/**
 * AdminJSModule — sets up the Society Admin panel at /panel.
 *
 * Auth:      JWT-based (Society Admin JWT from api-gateway)
 * Session:   Express-session; 8-hour TTL; HttpOnly/Secure/SameSite=Strict
 *
 * Section 16.1 / 16.4.2 / 16.7 of the PRD.
 */
@Module({
  imports: [
    AdminModule.createAdminAsync({
      useFactory: (configService: ConfigService) => buildAdminJsOptions(
        configService.getOrThrow<string>('ADMINJS_SESSION_SECRET'),
        configService.getOrThrow<string>('ADMINJS_COOKIE_SECRET'),
      ),
      inject: [ConfigService],
    }),
  ],
})
export class AdminJSModule {}
