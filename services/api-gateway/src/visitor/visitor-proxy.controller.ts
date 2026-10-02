import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common'
import { Observable } from 'rxjs'

import { UserRole } from '@society/shared-types'

import { ApproveRejectVisitorDto } from './dto/approve-reject-visitor.dto'
import { CreateVisitorLogDto } from './dto/create-visitor-log.dto'
import { PreApproveVisitorDto } from './dto/pre-approve-visitor.dto'
import { PreApprovedEntryDto } from './dto/pre-approved-entry.dto'
import { VisitorProxyService } from './visitor-proxy.service'
import { Roles } from '../auth/decorators/roles.decorator'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'

@Controller('visitors')
@UseGuards(JwtAuthGuard, RolesGuard)
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class VisitorProxyController {
  constructor(private readonly visitorProxyService: VisitorProxyService) {}

  /** Walk-in entry — guard terminal */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.GUARD, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  create(@Body() dto: CreateVisitorLogDto): Observable<unknown> {
    return this.visitorProxyService.createVisitorLog(dto)
  }

  /** Owner creates pre-approval token */
  @Post('pre-approve')
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.OWNER)
  preApprove(@Body() dto: PreApproveVisitorDto): Observable<unknown> {
    return this.visitorProxyService.preApproveVisitor(dto)
  }

  /** Guard enters pre-approved token at gate */
  @Post('pre-approved-entry')
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.GUARD, UserRole.ADMIN)
  preApprovedEntry(@Body() dto: PreApprovedEntryDto): Observable<unknown> {
    return this.visitorProxyService.preApprovedEntry(dto)
  }

  /** Owner approves visitor */
  @Patch(':id/approve')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.OWNER)
  approve(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ApproveRejectVisitorDto,
  ): Observable<unknown> {
    return this.visitorProxyService.approveVisitor(id, dto)
  }

  /** Owner rejects visitor */
  @Patch(':id/reject')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.OWNER)
  reject(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ApproveRejectVisitorDto,
  ): Observable<unknown> {
    return this.visitorProxyService.rejectVisitor(id, dto)
  }

  /** Guard marks visitor as entered (after approval) */
  @Patch(':id/enter')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.GUARD, UserRole.ADMIN)
  markEntry(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('guardId', ParseUUIDPipe) guardId: string,
  ): Observable<unknown> {
    return this.visitorProxyService.markEntry(id, guardId)
  }

  /** Guard marks visitor exit (fire-and-forget) */
  @Patch(':id/exit')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.GUARD, UserRole.ADMIN)
  exit(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('guardId', ParseUUIDPipe) guardId: string,
  ): void {
    this.visitorProxyService.recordVisitorExit(id, guardId)
  }
}
