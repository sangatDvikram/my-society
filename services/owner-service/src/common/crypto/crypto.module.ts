import { Global, Module } from '@nestjs/common'

import { KmsService } from './kms.service'
import { PhoneCryptoService } from './phone-crypto.service'

@Global()
@Module({
  providers: [KmsService, PhoneCryptoService],
  exports: [KmsService, PhoneCryptoService],
})
export class CryptoModule {}
