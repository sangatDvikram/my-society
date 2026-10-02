import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { VisitorLog } from './entities/visitor-log.entity'
import { VisitorController } from './visitor.controller'
import { VisitorService } from './visitor.service'

@Module({
  imports: [TypeOrmModule.forFeature([VisitorLog])],
  controllers: [VisitorController],
  providers: [VisitorService],
  exports: [VisitorService],
})
export class VisitorModule {}
