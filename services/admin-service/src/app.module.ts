import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { AdminJSModule } from './adminjs/adminjs.module'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { CommonModule } from './common/common.module'
import { DatabaseModule } from './database/database.module'
import { SocietyModule } from './society/society.module'
import { VisitorAdminModule } from './visitor/visitor.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    CommonModule,
    AdminJSModule,
    SocietyModule,
    VisitorAdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
