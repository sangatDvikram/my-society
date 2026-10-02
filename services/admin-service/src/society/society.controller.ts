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
  UseGuards,
} from '@nestjs/common'

import { UserRole } from '@society/shared-types'

import { CreateSocietyDto } from './dto/create-society.dto'
import { UpdateSocietyConfigDto } from './dto/update-society-config.dto'
import { UpdateSocietyDto } from './dto/update-society.dto'
import { SocietyService } from './society.service'
import { Roles } from '../common/decorators/roles.decorator'
import { JwtGuard } from '../common/guards/jwt.guard'
import { RolesGuard } from '../common/guards/roles.guard'

import type { SocietyConfig } from '../database/entities/society-config.entity'
import type { Society } from '../database/entities/society.entity'

@Controller('societies')
@UseGuards(JwtGuard, RolesGuard)
export class SocietyController {
  constructor(private readonly societyService: SocietyService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN)
  create(@Body() dto: CreateSocietyDto): Promise<Society> {
    return this.societyService.create(dto)
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  findAll(): Promise<Society[]> {
    return this.societyService.findAll()
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Society> {
    return this.societyService.findOne(id)
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateSocietyDto): Promise<Society> {
    return this.societyService.update(id, dto)
  }

  @Patch(':id/deactivate')
  @Roles(UserRole.SUPER_ADMIN)
  deactivate(@Param('id', ParseUUIDPipe) id: string): Promise<Society> {
    return this.societyService.deactivate(id)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.SUPER_ADMIN)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.societyService.softDelete(id)
  }

  @Get(':id/config')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  getConfig(@Param('id', ParseUUIDPipe) id: string): Promise<SocietyConfig> {
    return this.societyService.getConfig(id)
  }

  @Patch(':id/config')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  updateConfig(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSocietyConfigDto,
  ): Promise<SocietyConfig> {
    return this.societyService.updateConfig(id, dto)
  }
}
