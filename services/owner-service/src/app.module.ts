import { Module } from '@nestjs/common'

import { AppController } from './app.controller'
import { AppService } from './app.service'
import { CryptoModule } from './common/crypto/crypto.module'
import { DatabaseModule } from './database/database.module'
import { VisitorModule } from './visitor/visitor.module'

@Module({
  imports: [
    DatabaseModule,
    CryptoModule,
    VisitorModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
