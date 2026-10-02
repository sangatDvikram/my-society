import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches,
} from 'class-validator'

import { StaffSubRole } from '../../database/entities/user.entity'

export enum CreateUserRole {
  OWNER = 'OWNER',
  STAFF = 'STAFF',
  GUARD = 'GUARD',
}

export class CreateUserDto {
  @IsUUID()
  societyId!: string

  @IsString()
  @Matches(/^\+?[1-9]\d{6,14}$/, { message: 'phone must be a valid E.164 number' })
  phone!: string

  @IsEnum(CreateUserRole)
  role!: CreateUserRole

  @IsOptional()
  @IsString()
  @Length(1, 255)
  name?: string

  @IsOptional()
  @IsString()
  @Length(1, 255)
  email?: string

  @IsOptional()
  @IsUUID()
  flatId?: string

  @IsOptional()
  @IsEnum(StaffSubRole)
  staffSubRole?: StaffSubRole
}
