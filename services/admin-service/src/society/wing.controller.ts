import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'

import { UserRole } from '@society/shared-types'

import { CreateWingDto } from './dto/create-wing.dto'
import { WingService } from './wing.service'
import { Roles } from '../common/decorators/roles.decorator'
import { JwtGuard } from '../common/guards/jwt.guard'
import { RolesGuard } from '../common/guards/roles.guard'

import type { Wing } from '../database/entities/wing.entity'

@Controller('wings')
@UseGuards(JwtGuard, RolesGuard)
export class WingController {
  constructor(private readonly wingService: WingService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  create(@Body() dto: CreateWingDto): Promise<Wing> {
    return this.wingService.create(dto)
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  findBySociety(@Query('societyId', ParseUUIDPipe) societyId: string): Promise<Wing[]> {
    return this.wingService.findBySociety(societyId)
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Wing> {
    return this.wingService.findOne(id)
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: Partial<CreateWingDto>): Promise<Wing> {
    return this.wingService.update(id, dto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.wingService.softDelete(id)
  }
}
