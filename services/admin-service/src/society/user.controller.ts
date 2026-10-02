import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'

import { UserRole } from '@society/shared-types'

import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { UserService } from './user.service'
import { Roles } from '../common/decorators/roles.decorator'
import { JwtGuard } from '../common/guards/jwt.guard'
import { RolesGuard } from '../common/guards/roles.guard'

import type { User } from '../database/entities/user.entity'

@Controller('users')
@UseGuards(JwtGuard, RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  create(@Body() dto: CreateUserDto): Promise<Omit<User, 'phoneEncrypted'>> {
    return this.userService.create(dto)
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  findBySociety(@Query('societyId', ParseUUIDPipe) societyId: string): Promise<Array<Omit<User, 'phoneEncrypted'>>> {
    return this.userService.findBySociety(societyId)
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Omit<User, 'phoneEncrypted'>> {
    const user = await this.userService.findOne(id)
    const { phoneEncrypted: _enc, ...rest } = user
    return rest
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateUserDto): Promise<Omit<User, 'phoneEncrypted'>> {
    return this.userService.update(id, dto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.userService.softDelete(id)
  }
}
