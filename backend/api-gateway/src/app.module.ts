import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { DatabaseModule } from './database/database.module'
import { VisitorProxyModule } from './visitor/visitor-proxy.module'

/**
 * AppModule — root module of the api-gateway.
 *
 * Import order:
 *   DatabaseModule      — TypeORM PostgreSQL connection (gateway-local tables)
 *   VisitorProxyModule  — TCP ClientProxy + HTTP proxy endpoints for visitor ops
 *
 * As more domains are added (auth, payments, facilities …) their proxy modules
 * are imported here in the same pattern.
 */
@Module({
  imports: [
    DatabaseModule,
    VisitorProxyModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
