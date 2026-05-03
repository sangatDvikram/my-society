import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { AdminJSModule } from './adminjs/adminjs.module'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { DatabaseModule } from './database/database.module'

/**
 * AppModule — root module of the admin-service.
 *
 * Import order:
 *   ConfigModule   — loads .env / process.env globally
 *   DatabaseModule — TypeORM PostgreSQL connection
 *   AdminJSModule  — AdminJS panel at /panel (EPIC-15)
 */
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    AdminJSModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
