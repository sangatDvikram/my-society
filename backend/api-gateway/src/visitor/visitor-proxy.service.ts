import { Inject, Injectable, Logger } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { Observable } from 'rxjs'
import { timeout, catchError } from 'rxjs/operators'
import { throwError, TimeoutError } from 'rxjs'
import { CreateVisitorLogDto } from './dto/create-visitor-log.dto'

/**
 * VisitorProxyService
 *
 * Translates HTTP requests from the gateway controller into TCP messages
 * sent to owner-service via the NestJS ClientProxy.
 *
 * Two interaction patterns are used:
 *
 *  send()  → request/response  — waits for owner-service to reply.
 *            Used when the HTTP caller needs data back (e.g. created record).
 *
 *  emit()  → fire-and-forget   — no reply expected.
 *            Used for events the gateway doesn't need to wait on
 *            (e.g. visitor exit recording).
 */
@Injectable()
export class VisitorProxyService {
  private readonly logger = new Logger(VisitorProxyService.name)

  constructor(
    @Inject('OWNER_SERVICE') private readonly ownerClient: ClientProxy,
  ) {}

  /**
   * Forward visitor creation to owner-service.
   * Pattern: 'visitor.create'  (MessagePattern — request/response)
   * Returns an Observable that resolves to the saved VisitorLog record.
   */
  createVisitorLog(dto: CreateVisitorLogDto): Observable<unknown> {
    this.logger.log(`→ send('visitor.create') visitor=${dto.visitorName}`)

    return this.ownerClient.send<unknown, CreateVisitorLogDto>('visitor.create', dto).pipe(
      // Fail fast if owner-service is unresponsive — prevents HTTP hang
      timeout(5_000),
      catchError((err: unknown) => {
        if (err instanceof TimeoutError) {
          this.logger.error('owner-service timed out on visitor.create')
        }
        return throwError(() => err)
      }),
    )
  }

  /**
   * Notify owner-service that a visitor has exited.
   * Pattern: 'visitor.exit'  (EventPattern — fire-and-forget)
   * No reply is expected; the HTTP response returns immediately.
   */
  recordVisitorExit(visitorLogId: string): void {
    this.logger.log(`→ emit('visitor.exit') logId=${visitorLogId}`)
    this.ownerClient.emit<void, { visitorLogId: string }>('visitor.exit', {
      visitorLogId,
    })
  }
}
