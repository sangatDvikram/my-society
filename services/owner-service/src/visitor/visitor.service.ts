import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { CreateVisitorLogDto } from './dto/create-visitor-log.dto'
import { VisitorLog, VisitorStatus } from './entities/visitor-log.entity'

/**
 * VisitorService — domain logic for visitor log management.
 *
 * PII TODO notes reference EPIC-02 tasks that will be implemented next:
 *   - PhoneCryptoService  → AES-256-GCM encrypt / decrypt
 *   - HmacService         → HMAC-SHA256 phone hash
 *   - NotificationService → FCM push to owner (EPIC-14)
 */
@Injectable()
export class VisitorService {
  private readonly logger = new Logger(VisitorService.name)

  constructor(
    @InjectRepository(VisitorLog)
    private readonly visitorLogRepo: Repository<VisitorLog>,
  ) {}

  /**
   * Create a new visitor log entry.
   *
   * Current implementation stores placeholder encrypted values;
   * EPIC-02 will replace them with real AES-256-GCM ciphertext + HMAC hash.
   */
  async create(dto: CreateVisitorLogDto): Promise<VisitorLog> {
    // ── EPIC-02 TODO ─────────────────────────────────────────────────────────
    // const phoneEncrypted = await this.phoneCrypto.encrypt(dto.visitorPhone)
    // const phoneHash      = await this.hmac.hash(dto.visitorPhone)
    // ─────────────────────────────────────────────────────────────────────────
    const phoneEncrypted = `[ENCRYPTED:${dto.visitorPhone}]`  // placeholder
    const phoneHash      = `[HMAC:${dto.visitorPhone}]`       // placeholder

    const visitorLog = this.visitorLogRepo.create({
      societyId:        dto.societyId,
      flatId:           dto.flatId,
      visitorName:      dto.visitorName,
      phoneEncrypted,
      phoneHash,
      vehicleNumber:    dto.vehicleNumber ?? null,
      purpose:          dto.purpose,
      status:           VisitorStatus.PENDING,
      gdprConsentGiven: dto.gdprConsentGiven ?? false,
    })

    const saved = await this.visitorLogRepo.save(visitorLog)

    this.logger.log(
      `VisitorLog created | id=${saved.id} flat=${saved.flatId} visitor=${saved.visitorName}`,
    )

    // ── EPIC-14 TODO ─────────────────────────────────────────────────────────
    // await this.notificationService.pushToOwner(saved.flatId, {
    //   title: 'Visitor at gate',
    //   body:  `${saved.visitorName} wants to visit you`,
    //   data:  { visitorLogId: saved.id },
    // })
    // ─────────────────────────────────────────────────────────────────────────

    return saved
  }

  /**
   * Record that a visitor has exited the premises.
   * Called by EventPattern('visitor.exit') — fire-and-forget from api-gateway.
   */
  async recordExit(visitorLogId: string): Promise<void> {
    const log = await this.visitorLogRepo.findOne({ where: { id: visitorLogId } })

    if (!log) {
      // Log and return — don't throw; EventPattern handlers have no reply channel
      this.logger.warn(`recordExit: VisitorLog ${visitorLogId} not found`)
      return
    }

    await this.visitorLogRepo.update(visitorLogId, {
      status: VisitorStatus.EXITED,
      exitAt: new Date(),
    })

    this.logger.log(`VisitorLog ${visitorLogId} → EXITED`)
  }

  /**
   * Find a single visitor log by ID.
   * Used internally by other services (e.g. approval flow).
   */
  async findOne(id: string): Promise<VisitorLog> {
    const log = await this.visitorLogRepo.findOne({ where: { id } })
    if (!log) throw new NotFoundException(`VisitorLog ${id} not found`)
    return log
  }
}
