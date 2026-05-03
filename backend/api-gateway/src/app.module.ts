import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { CryptoModule } from './common/crypto/crypto.module'
import { DatabaseModule } from './database/database.module'
import { VisitorProxyModule } from './visitor/visitor-proxy.module'

/**
 * AppModule — root module of the api-gateway.
 *
 * Import order:
 *   ConfigModule        — loads .env / process.env; global so all modules can use ConfigService
 *   CryptoModule        — @Global(); provides KmsService + PhoneCryptoService everywhere
 *   DatabaseModule      — TypeORM PostgreSQL connection (gateway-local tables)
 *   VisitorProxyModule  — TCP ClientProxy + HTTP proxy endpoints for visitor ops
 *
 * As more domains are added (auth, payments, facilities …) their modules
 * are imported here in the same pattern.
 */
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CryptoModule,
    DatabaseModule,
    VisitorProxyModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
