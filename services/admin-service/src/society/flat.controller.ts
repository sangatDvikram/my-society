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

import { CreateFlatDto } from './dto/create-flat.dto'
import { UpdateFlatDto } from './dto/update-flat.dto'
import { FlatService } from './flat.service'
import { Roles } from '../common/decorators/roles.decorator'
import { JwtGuard } from '../common/guards/jwt.guard'
import { RolesGuard } from '../common/guards/roles.guard'

import type { Flat } from '../database/entities/flat.entity'

@Controller('flats')
@UseGuards(JwtGuard, RolesGuard)
export class FlatController {
  constructor(private readonly flatService: FlatService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  create(@Body() dto: CreateFlatDto): Promise<Flat> {
    return this.flatService.create(dto)
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  findBySociety(@Query('societyId', ParseUUIDPipe) societyId: string): Promise<Flat[]> {
    return this.flatService.findBySociety(societyId)
  }

  @Get('by-wing')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  findByWing(@Query('wingId', ParseUUIDPipe) wingId: string): Promise<Flat[]> {
    return this.flatService.findByWing(wingId)
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Flat> {
    return this.flatService.findOne(id)
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateFlatDto): Promise<Flat> {
    return this.flatService.update(id, dto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.flatService.softDelete(id)
  }
}
