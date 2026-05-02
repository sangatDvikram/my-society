import { Controller, Logger } from '@nestjs/common'
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices'
import { CreateVisitorLogDto } from './dto/create-visitor-log.dto'
import { VisitorLog } from './entities/visitor-log.entity'
import { VisitorService } from './visitor.service'

/**
 * VisitorController — NestJS microservice message handler.
 *
 * This controller does NOT use HTTP decorators (@Get, @Post).
 * Instead it listens for messages arriving over the TCP transport
 * that api-gateway sends via its ClientProxy.
 *
 * Two NestJS microservice patterns are demonstrated:
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ @MessagePattern  — Request / Response                                   │
 * │   api-gateway calls client.send('visitor.create', dto)                  │
 * │   owner-service executes the handler and returns a value.               │
 * │   api-gateway receives the returned value as an Observable.             │
 * └─────────────────────────────────────────────────────────────────────────┘
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ @EventPattern  — Fire-and-Forget                                        │
 * │   api-gateway calls client.emit('visitor.exit', data)                   │
 * │   owner-service handles the event but sends NO reply.                   │
 * │   api-gateway does NOT wait for completion.                             │
 * └─────────────────────────────────────────────────────────────────────────┘
 */
@Controller()
export class VisitorController {
  private readonly logger = new Logger(VisitorController.name)

  constructor(private readonly visitorService: VisitorService) {}

  /**
   * Handle visitor creation — request/response.
   *
   * Triggered by: ownerClient.send('visitor.create', dto) in api-gateway.
   * Returns:      The saved VisitorLog entity serialised to JSON.
   *
   * The @Payload() decorator extracts the message data from the TCP frame.
   * NestJS automatically serialises the return value and sends it back.
   */
  @MessagePattern('visitor.create')
  async handleCreate(@Payload() dto: CreateVisitorLogDto): Promise<VisitorLog> {
    this.logger.log(
      `[MSG visitor.create] visitor=${dto.visitorName} flat=${dto.flatId}`,
    )
    return this.visitorService.create(dto)
  }

  /**
   * Handle visitor exit — fire-and-forget event.
   *
   * Triggered by: ownerClient.emit('visitor.exit', { visitorLogId }) in api-gateway.
   * Returns:      void — no value is sent back over the wire.
   *
   * This is intentionally async but the caller never awaits the result.
   * Keep side effects idempotent — the event may arrive more than once
   * in at-least-once delivery scenarios.
   */
  @EventPattern('visitor.exit')
  async handleExit(
    @Payload() data: { visitorLogId: string },
  ): Promise<void> {
    this.logger.log(`[EVT visitor.exit] logId=${data.visitorLogId}`)
    await this.visitorService.recordExit(data.visitorLogId)
  }
}
