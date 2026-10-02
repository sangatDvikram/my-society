import { InjectQueue } from '@nestjs/bullmq'
import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common'
import { Queue } from 'bullmq'

import { UserRole } from '@society/shared-types'

import {
  DEK_ROTATION_QUEUE,
  HMAC_ROTATION_QUEUE,
  type DekRotationJobData,
  type HmacRotationJobData,
} from './crypto-rotation.processor'
import { RotateKeyDto } from './dto/rotate-key.dto'
import { Roles } from '../auth/decorators/roles.decorator'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'

@Controller('admin/crypto')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
export class CryptoRotationController {
  constructor(
    @InjectQueue(DEK_ROTATION_QUEUE) private readonly dekQueue: Queue<DekRotationJobData>,
    @InjectQueue(HMAC_ROTATION_QUEUE) private readonly hmacQueue: Queue<HmacRotationJobData>,
  ) {}

  @Post('rotate-dek')
  @HttpCode(HttpStatus.ACCEPTED)
  async rotateDek(@Body() dto: RotateKeyDto): Promise<{ jobId: string; status: string }> {
    const job = await this.dekQueue.add('rotate', { newDekHex: dto.newKeyHex })
    return { jobId: job.id ?? 'unknown', status: 'queued' }
  }

  @Post('rotate-hmac')
  @HttpCode(HttpStatus.ACCEPTED)
  async rotateHmac(@Body() dto: RotateKeyDto): Promise<{ jobId: string; status: string }> {
    const job = await this.hmacQueue.add('rotate', { newHmacSecretHex: dto.newKeyHex })
    return { jobId: job.id ?? 'unknown', status: 'queued' }
  }
}
