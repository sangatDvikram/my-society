import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  UseGuards,
} from '@nestjs/common'

import { UserRole } from '@society/shared-types'

import { VisitorAdminService } from './visitor.service'
import { Roles } from '../common/decorators/roles.decorator'
import { JwtGuard } from '../common/guards/jwt.guard'
import { RolesGuard } from '../common/guards/roles.guard'

import type { VisitorLog, VisitorStatus } from '../database/entities/visitor-log.entity'

@Controller('visitor-logs')
@UseGuards(JwtGuard, RolesGuard)
export class VisitorAdminController {
  constructor(private readonly visitorAdminService: VisitorAdminService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.GUARD)
  findBySociety(
    @Query('societyId', ParseUUIDPipe) societyId: string,
    @Query('date') date?: string,
    @Query('status') status?: VisitorStatus,
    @Query('hostFlatId') hostFlatId?: string,
  ): Promise<VisitorLog[]> {
    return this.visitorAdminService.findBySociety(societyId, { date, status, hostFlatId })
  }

  @Get('today-stats')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  todayStats(@Query('societyId', ParseUUIDPipe) societyId: string): Promise<Record<string, number>> {
    return this.visitorAdminService.todayStats(societyId)
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.GUARD)
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('societyId', ParseUUIDPipe) societyId: string,
  ): Promise<VisitorLog> {
    return this.visitorAdminService.findOne(id, societyId)
  }
}
