import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { VisitorLog, VisitorStatus } from '../database/entities/visitor-log.entity'

@Injectable()
export class VisitorAdminService {
  constructor(
    @InjectRepository(VisitorLog)
    private readonly visitorLogRepo: Repository<VisitorLog>,
  ) {}

  async findBySociety(
    societyId: string,
    opts: { date?: string; status?: VisitorStatus; hostFlatId?: string },
  ): Promise<VisitorLog[]> {
    const qb = this.visitorLogRepo
      .createQueryBuilder('v')
      .where('v.societyId = :sid', { sid: societyId })
      .orderBy('v.createdAt', 'DESC')
      .limit(200)

    if (opts.date) qb.andWhere('DATE(v.createdAt) = :date', { date: opts.date })
    if (opts.status) qb.andWhere('v.status = :status', { status: opts.status })
    if (opts.hostFlatId) qb.andWhere('v.hostFlatId = :flatId', { flatId: opts.hostFlatId })

    return qb.getMany()
  }

  async findOne(id: string, societyId: string): Promise<VisitorLog> {
    const log = await this.visitorLogRepo.findOne({ where: { id, societyId } })
    if (!log) throw new NotFoundException(`VisitorLog ${id} not found`)
    return log
  }

  async todayStats(societyId: string): Promise<Record<string, number>> {
    const today = new Date().toISOString().slice(0, 10)
    const rows = await this.visitorLogRepo
      .createQueryBuilder('v')
      .select('v.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('v.societyId = :sid', { sid: societyId })
      .andWhere('DATE(v.createdAt) = :today', { today })
      .groupBy('v.status')
      .getRawMany<{ status: string; count: string }>()

    return Object.fromEntries(rows.map(r => [r.status, parseInt(r.count, 10)]))
  }
}
