import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { CreateFlatDto } from './dto/create-flat.dto'
import { UpdateFlatDto } from './dto/update-flat.dto'
import { Flat, FlatStatus } from '../database/entities/flat.entity'

@Injectable()
export class FlatService {
  private readonly logger = new Logger(FlatService.name)

  constructor(
    @InjectRepository(Flat)
    private readonly flatRepo: Repository<Flat>,
  ) {}

  async create(dto: CreateFlatDto): Promise<Flat> {
    const existing = await this.flatRepo.findOne({
      where: { societyId: dto.societyId, flatNumber: dto.flatNumber },
    })
    if (existing) throw new ConflictException(`Flat "${dto.flatNumber}" already exists in this society`)

    const flat = this.flatRepo.create(dto)
    const saved = await this.flatRepo.save(flat)
    this.logger.log(`Flat created: ${saved.id} society=${dto.societyId} flat=${dto.flatNumber}`)
    return saved
  }

  async findBySociety(societyId: string): Promise<Flat[]> {
    return this.flatRepo.find({ where: { societyId } })
  }

  async findByWing(wingId: string): Promise<Flat[]> {
    return this.flatRepo.find({ where: { wingId } })
  }

  async findOne(id: string): Promise<Flat> {
    const flat = await this.flatRepo.findOne({ where: { id } })
    if (!flat) throw new NotFoundException(`Flat ${id} not found`)
    return flat
  }

  async findBySocietyAndFlat(societyId: string, flatNumber: string): Promise<Flat | null> {
    return this.flatRepo.findOne({ where: { societyId, flatNumber } })
  }

  async assignOwner(id: string, ownerId: string): Promise<Flat> {
    const flat = await this.findOne(id)
    flat.ownerId = ownerId
    flat.status = FlatStatus.OCCUPIED
    return this.flatRepo.save(flat)
  }

  async update(id: string, dto: UpdateFlatDto): Promise<Flat> {
    const flat = await this.findOne(id)
    Object.assign(flat, dto)
    return this.flatRepo.save(flat)
  }

  async softDelete(id: string): Promise<void> {
    await this.findOne(id)
    await this.flatRepo.softDelete(id)
  }
}
