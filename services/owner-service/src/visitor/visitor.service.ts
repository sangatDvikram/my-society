import { createHash, randomInt } from 'crypto'

import { Injectable, Logger, NotFoundException, UnprocessableEntityException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { CreateVisitorLogDto } from './dto/create-visitor-log.dto'
import { PreApproveVisitorDto } from './dto/pre-approve-visitor.dto'
import { PreApprovedEntryDto } from './dto/pre-approved-entry.dto'
import { RecordExitDto } from './dto/record-exit.dto'
import { VisitorLog, VisitorStatus } from './entities/visitor-log.entity'
import { PhoneCryptoService } from '../common/crypto/phone-crypto.service'

@Injectable()
export class VisitorService {
  private readonly logger = new Logger(VisitorService.name)

  constructor(
    @InjectRepository(VisitorLog)
    private readonly visitorLogRepo: Repository<VisitorLog>,
    private readonly phoneCrypto: PhoneCryptoService,
  ) {}

  async create(dto: CreateVisitorLogDto): Promise<VisitorLog> {
    const visitorPhoneEncrypted = this.phoneCrypto.encryptPhone(dto.visitorPhone)
    const visitorPhoneHash = this.phoneCrypto.hashPhone(dto.visitorPhone)

    const visitorLog = this.visitorLogRepo.create({
      societyId: dto.societyId,
      hostFlatId: dto.hostFlatId,
      visitorName: dto.visitorName,
      visitorPhoneEncrypted,
      visitorPhoneHash,
      vehicleNumber: dto.vehicleNumber ?? null,
      purpose: dto.purpose,
      gdprConsent: dto.gdprConsent ?? false,
      entryGuardId: dto.entryGuardId,
      status: VisitorStatus.PENDING,
    })

    const saved = await this.visitorLogRepo.save(visitorLog)
    this.logger.log(`VisitorLog created: ${saved.id} flat=${dto.hostFlatId}`)

    // EPIC-14 TODO: push notification to flat owner
    // await this.notificationService.pushToFlatOwner(dto.hostFlatId, { visitorLogId: saved.id })

    return saved
  }

  async approve(visitorLogId: string, ownerId: string): Promise<void> {
    const log = await this.findOne(visitorLogId)
    if (log.status !== VisitorStatus.PENDING) {
      throw new UnprocessableEntityException(`Visitor log ${visitorLogId} is not in PENDING state`)
    }
    log.status = VisitorStatus.APPROVED
    await this.visitorLogRepo.save(log)
    this.logger.log(`VisitorLog ${visitorLogId} approved by owner ${ownerId}`)
  }

  async reject(visitorLogId: string, ownerId: string): Promise<void> {
    const log = await this.findOne(visitorLogId)
    if (log.status !== VisitorStatus.PENDING) {
      throw new UnprocessableEntityException(`Visitor log ${visitorLogId} is not in PENDING state`)
    }
    log.status = VisitorStatus.REJECTED
    await this.visitorLogRepo.save(log)
    this.logger.log(`VisitorLog ${visitorLogId} rejected by owner ${ownerId}`)
  }

  async timeout(visitorLogId: string): Promise<void> {
    const log = await this.visitorLogRepo.findOne({ where: { id: visitorLogId, status: VisitorStatus.PENDING } })
    if (!log) return
    log.status = VisitorStatus.TIMEOUT
    await this.visitorLogRepo.save(log)
    this.logger.warn(`VisitorLog ${visitorLogId} timed out (no owner response within 2 min)`)
  }

  async markEntry(visitorLogId: string, guardId: string): Promise<void> {
    const log = await this.findOne(visitorLogId)
    if (log.status !== VisitorStatus.APPROVED) {
      throw new UnprocessableEntityException('Visitor must be in APPROVED state before marking entry')
    }
    log.status = VisitorStatus.INSIDE
    log.entryTime = new Date()
    log.entryGuardId = guardId
    await this.visitorLogRepo.save(log)
  }

  async recordExit(dto: RecordExitDto): Promise<void> {
    const log = await this.visitorLogRepo.findOne({ where: { id: dto.visitorLogId } })
    if (!log) {
      this.logger.warn(`recordExit: VisitorLog ${dto.visitorLogId} not found`)
      return
    }
    log.status = VisitorStatus.EXITED
    log.exitTime = new Date()
    log.exitGuardId = dto.exitGuardId
    await this.visitorLogRepo.save(log)
    this.logger.log(`VisitorLog ${dto.visitorLogId} → EXITED`)
  }

  async preApprove(dto: PreApproveVisitorDto): Promise<{ token: string; visitorLogId: string }> {
    const token = randomInt(100000, 999999).toString()
    const tokenHash = createHash('sha256').update(token).digest('hex')

    const visitorLog = this.visitorLogRepo.create({
      societyId: dto.societyId,
      hostFlatId: dto.hostFlatId,
      visitorName: dto.visitorName,
      purpose: dto.purpose,
      vehicleNumber: dto.vehicleNumber ?? null,
      preApprovedTokenHash: tokenHash,
      status: VisitorStatus.APPROVED,
    })

    const saved = await this.visitorLogRepo.save(visitorLog)
    this.logger.log(`PreApproval created: ${saved.id} flat=${dto.hostFlatId}`)

    return { token, visitorLogId: saved.id }
  }

  async preApprovedEntry(dto: PreApprovedEntryDto): Promise<VisitorLog> {
    const tokenHash = createHash('sha256').update(dto.token).digest('hex')

    // Must find by societyId + tokenHash + status=APPROVED (not yet entered)
    const log = await this.visitorLogRepo
      .createQueryBuilder('v')
      .where('v.societyId = :sid', { sid: dto.societyId })
      .andWhere('v.preApprovedTokenHash = :hash', { hash: tokenHash })
      .addSelect('v.preApprovedTokenHash')
      .getOne()

    if (!log) throw new NotFoundException('Invalid or expired pre-approval token')
    if (log.status !== VisitorStatus.APPROVED) {
      throw new UnprocessableEntityException('Pre-approval token has already been used')
    }

    log.status = VisitorStatus.INSIDE
    log.entryTime = new Date()
    log.entryGuardId = dto.entryGuardId
    log.preApprovedTokenHash = null

    return this.visitorLogRepo.save(log)
  }

  async findOne(id: string): Promise<VisitorLog> {
    const log = await this.visitorLogRepo.findOne({ where: { id } })
    if (!log) throw new NotFoundException(`VisitorLog ${id} not found`)
    return log
  }

  async findBySociety(societyId: string, date?: string): Promise<VisitorLog[]> {
    const qb = this.visitorLogRepo
      .createQueryBuilder('v')
      .where('v.societyId = :sid', { sid: societyId })
      .orderBy('v.createdAt', 'DESC')

    if (date) {
      qb.andWhere('DATE(v.createdAt) = :date', { date })
    }

    return qb.getMany()
  }
}
