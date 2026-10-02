import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { PhoneCryptoService } from '../common/crypto/phone-crypto.service'
import { User, UserStatus } from '../database/entities/user.entity'

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name)

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly phoneCrypto: PhoneCryptoService,
  ) {}

  async create(dto: CreateUserDto): Promise<Omit<User, 'phoneEncrypted'>> {
    const phoneHash = this.phoneCrypto.hashPhone(dto.phone)
    const existing = await this.userRepo.findOne({
      where: { societyId: dto.societyId, phoneHash },
    })
    if (existing) throw new ConflictException('A user with this phone number already exists in this society')

    const phoneEncrypted = this.phoneCrypto.encryptPhone(dto.phone)
    const user = this.userRepo.create({
      societyId: dto.societyId,
      role: dto.role,
      name: dto.name,
      email: dto.email,
      flatId: dto.flatId,
      staffSubRole: dto.staffSubRole ?? null,
      phoneEncrypted,
      phoneHash,
      status: UserStatus.INVITED,
    })

    const saved = await this.userRepo.save(user)
    this.logger.log(`User created: ${saved.id} role=${dto.role} society=${dto.societyId}`)

    const { phoneEncrypted: _enc, ...rest } = saved
    return rest
  }

  async findBySociety(societyId: string): Promise<Array<Omit<User, 'phoneEncrypted'>>> {
    const users = await this.userRepo.find({ where: { societyId } })
    return users.map(({ phoneEncrypted: _enc, ...rest }) => rest)
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id } })
    if (!user) throw new NotFoundException(`User ${id} not found`)
    return user
  }

  async findByPhoneHash(societyId: string, phone: string): Promise<User | null> {
    const phoneHash = this.phoneCrypto.hashPhone(phone)
    return this.userRepo.findOne({ where: { societyId, phoneHash } })
  }

  async update(id: string, dto: UpdateUserDto): Promise<Omit<User, 'phoneEncrypted'>> {
    const user = await this.findOne(id)
    Object.assign(user, dto)
    const saved = await this.userRepo.save(user)
    const { phoneEncrypted: _enc, ...rest } = saved
    return rest
  }

  async softDelete(id: string): Promise<void> {
    await this.findOne(id)
    await this.userRepo.softDelete(id)
  }
}
