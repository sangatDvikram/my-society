import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { VisitorAdminController } from './visitor.controller'
import { VisitorAdminService } from './visitor.service'
import { VisitorLog } from '../database/entities/visitor-log.entity'

@Module({
  imports: [TypeOrmModule.forFeature([VisitorLog])],
  controllers: [VisitorAdminController],
  providers: [VisitorAdminService],
})
export class VisitorAdminModule {}
