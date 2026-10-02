import { IsEnum, IsOptional, IsString, IsUUID, Length } from 'class-validator'

import { StaffSubRole, UserStatus } from '../../database/entities/user.entity'

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @Length(1, 255)
  name?: string

  @IsOptional()
  @IsString()
  @Length(1, 255)
  email?: string

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus

  @IsOptional()
  @IsUUID()
  flatId?: string

  @IsOptional()
  @IsEnum(StaffSubRole)
  staffSubRole?: StaffSubRole
}
