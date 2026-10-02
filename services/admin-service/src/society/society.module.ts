import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { FlatController } from './flat.controller'
import { FlatService } from './flat.service'
import { SocietyController } from './society.controller'
import { SocietyService } from './society.service'
import { UserController } from './user.controller'
import { UserService } from './user.service'
import { WingController } from './wing.controller'
import { WingService } from './wing.service'
import { Flat } from '../database/entities/flat.entity'
import { SocietyConfig } from '../database/entities/society-config.entity'
import { Society } from '../database/entities/society.entity'
import { User } from '../database/entities/user.entity'
import { Wing } from '../database/entities/wing.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Society, SocietyConfig, Wing, Flat, User])],
  controllers: [SocietyController, WingController, FlatController, UserController],
  providers: [SocietyService, WingService, FlatService, UserService],
  exports: [SocietyService, UserService, FlatService],
})
export class SocietyModule {}
