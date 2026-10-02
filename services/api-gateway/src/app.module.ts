import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { ThrottlerModule } from '@nestjs/throttler'

import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthModule } from './auth/auth.module'
import { CryptoModule } from './common/crypto/crypto.module'
import { CryptoRotationModule } from './crypto-rotation/crypto-rotation.module'
import { DatabaseModule } from './database/database.module'
import { VisitorProxyModule } from './visitor/visitor-proxy.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => [
        {
          ttl: configService.get<number>('THROTTLE_TTL', 60) * 1000,
          limit: configService.get<number>('THROTTLE_LIMIT', 100),
        },
      ],
    }),
    CryptoModule,
    DatabaseModule,
    AuthModule,
    CryptoRotationModule,
    VisitorProxyModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
