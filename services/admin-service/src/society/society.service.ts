import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { CreateSocietyDto } from './dto/create-society.dto'
import { UpdateSocietyConfigDto } from './dto/update-society-config.dto'
import { UpdateSocietyDto } from './dto/update-society.dto'
import { SocietyConfig } from '../database/entities/society-config.entity'
import { Society, SocietyStatus } from '../database/entities/society.entity'

@Injectable()
export class SocietyService {
  private readonly logger = new Logger(SocietyService.name)

  constructor(
    @InjectRepository(Society)
    private readonly societyRepo: Repository<Society>,
    @InjectRepository(SocietyConfig)
    private readonly configRepo: Repository<SocietyConfig>,
  ) {}

  async create(dto: CreateSocietyDto): Promise<Society> {
    const society = this.societyRepo.create(dto)
    const saved = await this.societyRepo.save(society)

    const config = this.configRepo.create({ societyId: saved.id })
    await this.configRepo.save(config)

    this.logger.log(`Society created: ${saved.id} name=${saved.name}`)
    return saved
  }

  async findAll(): Promise<Society[]> {
    return this.societyRepo.find()
  }

  async findOne(id: string): Promise<Society> {
    const society = await this.societyRepo.findOne({ where: { id } })
    if (!society) throw new NotFoundException(`Society ${id} not found`)
    return society
  }

  async update(id: string, dto: UpdateSocietyDto): Promise<Society> {
    const society = await this.findOne(id)
    Object.assign(society, dto)
    return this.societyRepo.save(society)
  }

  async deactivate(id: string): Promise<Society> {
    const society = await this.findOne(id)
    society.status = SocietyStatus.INACTIVE
    return this.societyRepo.save(society)
  }

  async softDelete(id: string): Promise<void> {
    await this.findOne(id)
    await this.societyRepo.softDelete(id)
    this.logger.log(`Society soft-deleted: ${id}`)
  }

  async getConfig(societyId: string): Promise<SocietyConfig> {
    const config = await this.configRepo.findOne({ where: { societyId } })
    if (!config) {
      const newConfig = this.configRepo.create({ societyId })
      return this.configRepo.save(newConfig)
    }
    return config
  }

  async updateConfig(societyId: string, dto: UpdateSocietyConfigDto): Promise<SocietyConfig> {
    const config = await this.getConfig(societyId)
    Object.assign(config, dto)
    return this.configRepo.save(config)
  }
}
