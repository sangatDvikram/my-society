import { BullModule } from '@nestjs/bullmq'
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'

import { CryptoRotationController } from './crypto-rotation.controller'
import {
  DEK_ROTATION_QUEUE,
  DekRotationProcessor,
  HMAC_ROTATION_QUEUE,
  HmacRotationProcessor,
} from './crypto-rotation.processor'
import { AuthModule } from '../auth/auth.module'

@Module({
  imports: [
    ConfigModule,
    AuthModule,
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          url: configService.get<string>('REDIS_URL', 'redis://localhost:6379'),
        },
      }),
    }),
    BullModule.registerQueue(
      { name: DEK_ROTATION_QUEUE },
      { name: HMAC_ROTATION_QUEUE },
    ),
  ],
  controllers: [CryptoRotationController],
  providers: [DekRotationProcessor, HmacRotationProcessor],
})
export class CryptoRotationModule {}
