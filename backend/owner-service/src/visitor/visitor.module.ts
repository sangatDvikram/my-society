import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { VisitorLog } from './entities/visitor-log.entity'
import { VisitorController } from './visitor.controller'
import { VisitorService } from './visitor.service'

/**
 * VisitorModule — domain module for visitor log management.
 *
 * TypeOrmModule.forFeature([VisitorLog]) registers the entity
 * with the connection configured in DatabaseModule, making the
 * TypeORM Repository<VisitorLog> available for injection.
 *
 * Adding a new domain module follows the exact same pattern:
 *   1. Create entity → dto → service → controller → module
 *   2. Import TypeOrmModule.forFeature([YourEntity])
 *   3. Add YourModule to AppModule imports
 */
@Module({
  imports: [TypeOrmModule.forFeature([VisitorLog])],
  controllers: [VisitorController],
  providers: [VisitorService],
  exports: [VisitorService],   // export if other modules need VisitorService
})
export class VisitorModule {}
