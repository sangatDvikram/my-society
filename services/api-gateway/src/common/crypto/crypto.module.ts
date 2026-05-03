import { Global, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { KmsService } from './kms.service'
import { PhoneCryptoService } from './phone-crypto.service'

/**
 * CryptoModule
 *
 * Global NestJS module that provides `KmsService` and `PhoneCryptoService`
 * to every other module in the api-gateway without requiring explicit imports.
 *
 * Marked `@Global()` so that:
 *   - `AuthModule` can inject `PhoneCryptoService` for OTP phone hashing
 *   - Future payment / tenant modules can encrypt phone/bank-account fields
 *   - No module needs to re-import `CryptoModule`
 *
 * Import `CryptoModule` once in `AppModule`; all other modules get the
 * providers through the global scope.
 */
@Global()
@Module({
  imports: [ConfigModule],
  providers: [KmsService, PhoneCryptoService],
  exports: [KmsService, PhoneCryptoService],
})
export class CryptoModule {}
