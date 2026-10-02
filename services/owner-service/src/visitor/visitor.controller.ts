import { Controller, Logger } from '@nestjs/common'
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices'

import { CreateVisitorLogDto } from './dto/create-visitor-log.dto'
import { PreApproveVisitorDto } from './dto/pre-approve-visitor.dto'
import { PreApprovedEntryDto } from './dto/pre-approved-entry.dto'
import { RecordExitDto } from './dto/record-exit.dto'
import { VisitorLog } from './entities/visitor-log.entity'
import { VisitorService } from './visitor.service'

@Controller()
export class VisitorController {
  private readonly logger = new Logger(VisitorController.name)

  constructor(private readonly visitorService: VisitorService) {}

  @MessagePattern('visitor.create')
  async handleCreate(@Payload() dto: CreateVisitorLogDto): Promise<VisitorLog> {
    this.logger.log(`[MSG visitor.create] visitor=${dto.visitorName} flat=${dto.hostFlatId}`)
    return this.visitorService.create(dto)
  }

  @MessagePattern('visitor.approve')
  async handleApprove(@Payload() data: { visitorLogId: string; ownerId: string }): Promise<void> {
    this.logger.log(`[MSG visitor.approve] logId=${data.visitorLogId}`)
    await this.visitorService.approve(data.visitorLogId, data.ownerId)
  }

  @MessagePattern('visitor.reject')
  async handleReject(@Payload() data: { visitorLogId: string; ownerId: string }): Promise<void> {
    this.logger.log(`[MSG visitor.reject] logId=${data.visitorLogId}`)
    await this.visitorService.reject(data.visitorLogId, data.ownerId)
  }

  @MessagePattern('visitor.markEntry')
  async handleMarkEntry(@Payload() data: { visitorLogId: string; guardId: string }): Promise<void> {
    this.logger.log(`[MSG visitor.markEntry] logId=${data.visitorLogId}`)
    await this.visitorService.markEntry(data.visitorLogId, data.guardId)
  }

  @EventPattern('visitor.exit')
  async handleExit(@Payload() dto: RecordExitDto): Promise<void> {
    this.logger.log(`[EVT visitor.exit] logId=${dto.visitorLogId}`)
    await this.visitorService.recordExit(dto)
  }

  @MessagePattern('visitor.preApprove')
  async handlePreApprove(
    @Payload() dto: PreApproveVisitorDto,
  ): Promise<{ token: string; visitorLogId: string }> {
    this.logger.log(`[MSG visitor.preApprove] flat=${dto.hostFlatId}`)
    return this.visitorService.preApprove(dto)
  }

  @MessagePattern('visitor.preApprovedEntry')
  async handlePreApprovedEntry(@Payload() dto: PreApprovedEntryDto): Promise<VisitorLog> {
    this.logger.log(`[MSG visitor.preApprovedEntry] societyId=${dto.societyId}`)
    return this.visitorService.preApprovedEntry(dto)
  }
}
