import { Global, Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'

import { KmsService } from './crypto/kms.service'
import { PhoneCryptoService } from './crypto/phone-crypto.service'
import { JwtGuard } from './guards/jwt.guard'
import { RolesGuard } from './guards/roles.guard'

@Global()
@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
      }),
    }),
  ],
  providers: [JwtGuard, RolesGuard, KmsService, PhoneCryptoService],
  exports: [JwtGuard, RolesGuard, JwtModule, KmsService, PhoneCryptoService],
})
export class CommonModule {}
