import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { CreateVisitorLogDto } from './dto/create-visitor-log.dto'
import { VisitorProxyService } from './visitor-proxy.service'

/**
 * VisitorProxyController
 *
 * Exposes the public-facing REST endpoints for visitor management.
 * Each action is forwarded to owner-service via TCP (ClientProxy).
 *
 * Routes (all prefixed with /api/v1 from main.ts setGlobalPrefix):
 *   POST   /api/v1/visitors            — create walk-in visitor log
 *   PATCH  /api/v1/visitors/:id/exit   — record exit (fire-and-forget)
 *
 * In a production flow the JWT guard would sit here extracting societyId
 * from the token payload.  That is implemented in EPIC-02.
 */
@Controller('visitors')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class VisitorProxyController {
  constructor(private readonly visitorProxyService: VisitorProxyService) {}

  /**
   * POST /api/v1/visitors
   *
   * Walk-in visitor entry — guard captures details at the gate terminal.
   * Returns the newly created VisitorLog record received from owner-service.
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateVisitorLogDto): Observable<unknown> {
    return this.visitorProxyService.createVisitorLog(dto)
  }

  /**
   * PATCH /api/v1/visitors/:id/exit
   *
   * Guard marks visitor as exited.
   * Fire-and-forget: owner-service updates the record asynchronously.
   * The HTTP response returns 204 No Content immediately.
   */
  @Patch(':id/exit')
  @HttpCode(HttpStatus.NO_CONTENT)
  exit(@Param('id', ParseUUIDPipe) id: string): void {
    this.visitorProxyService.recordVisitorExit(id)
  }
}
