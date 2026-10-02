import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { CreateWingDto } from './dto/create-wing.dto'
import { Wing } from '../database/entities/wing.entity'

@Injectable()
export class WingService {
  private readonly logger = new Logger(WingService.name)

  constructor(
    @InjectRepository(Wing)
    private readonly wingRepo: Repository<Wing>,
  ) {}

  async create(dto: CreateWingDto): Promise<Wing> {
    const existing = await this.wingRepo.findOne({
      where: { societyId: dto.societyId, name: dto.name },
    })
    if (existing) throw new ConflictException(`Wing "${dto.name}" already exists in this society`)

    const wing = this.wingRepo.create(dto)
    const saved = await this.wingRepo.save(wing)
    this.logger.log(`Wing created: ${saved.id} society=${dto.societyId} name=${dto.name}`)
    return saved
  }

  async findBySociety(societyId: string): Promise<Wing[]> {
    return this.wingRepo.find({ where: { societyId } })
  }

  async findOne(id: string): Promise<Wing> {
    const wing = await this.wingRepo.findOne({ where: { id } })
    if (!wing) throw new NotFoundException(`Wing ${id} not found`)
    return wing
  }

  async update(id: string, dto: Partial<CreateWingDto>): Promise<Wing> {
    const wing = await this.findOne(id)
    Object.assign(wing, dto)
    return this.wingRepo.save(wing)
  }

  async softDelete(id: string): Promise<void> {
    await this.findOne(id)
    await this.wingRepo.softDelete(id)
  }
}
