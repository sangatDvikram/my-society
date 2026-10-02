import { Inject, Injectable, Logger } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { catchError, Observable, throwError, TimeoutError } from 'rxjs'
import { timeout } from 'rxjs/operators'

import { ApproveRejectVisitorDto } from './dto/approve-reject-visitor.dto'
import { CreateVisitorLogDto } from './dto/create-visitor-log.dto'
import { PreApproveVisitorDto } from './dto/pre-approve-visitor.dto'
import { PreApprovedEntryDto } from './dto/pre-approved-entry.dto'

@Injectable()
export class VisitorProxyService {
  private readonly logger = new Logger(VisitorProxyService.name)

  constructor(
    @Inject('OWNER_SERVICE') private readonly ownerClient: ClientProxy,
  ) {}

  createVisitorLog(dto: CreateVisitorLogDto): Observable<unknown> {
    this.logger.log(`→ send('visitor.create') visitor=${dto.visitorName}`)
    return this.ownerClient.send<unknown, CreateVisitorLogDto>('visitor.create', dto).pipe(
      timeout(5_000),
      catchError((err: unknown) => {
        if (err instanceof TimeoutError) {
          this.logger.error('owner-service timed out on visitor.create')
        }
        return throwError(() => err)
      }),
    )
  }

  approveVisitor(visitorLogId: string, dto: ApproveRejectVisitorDto): Observable<unknown> {
    this.logger.log(`→ send('visitor.approve') logId=${visitorLogId}`)
    return this.ownerClient
      .send<unknown>('visitor.approve', { visitorLogId, ownerId: dto.ownerId })
      .pipe(timeout(5_000))
  }

  rejectVisitor(visitorLogId: string, dto: ApproveRejectVisitorDto): Observable<unknown> {
    this.logger.log(`→ send('visitor.reject') logId=${visitorLogId}`)
    return this.ownerClient
      .send<unknown>('visitor.reject', { visitorLogId, ownerId: dto.ownerId })
      .pipe(timeout(5_000))
  }

  markEntry(visitorLogId: string, guardId: string): Observable<unknown> {
    this.logger.log(`→ send('visitor.markEntry') logId=${visitorLogId}`)
    return this.ownerClient
      .send<unknown>('visitor.markEntry', { visitorLogId, guardId })
      .pipe(timeout(5_000))
  }

  recordVisitorExit(visitorLogId: string, exitGuardId: string): void {
    this.logger.log(`→ emit('visitor.exit') logId=${visitorLogId}`)
    this.ownerClient.emit<void>('visitor.exit', { visitorLogId, exitGuardId })
  }

  preApproveVisitor(dto: PreApproveVisitorDto): Observable<unknown> {
    this.logger.log(`→ send('visitor.preApprove') flat=${dto.hostFlatId}`)
    return this.ownerClient.send<unknown>('visitor.preApprove', dto).pipe(timeout(5_000))
  }

  preApprovedEntry(dto: PreApprovedEntryDto): Observable<unknown> {
    this.logger.log(`→ send('visitor.preApprovedEntry') society=${dto.societyId}`)
    return this.ownerClient.send<unknown>('visitor.preApprovedEntry', dto).pipe(timeout(5_000))
  }
}
