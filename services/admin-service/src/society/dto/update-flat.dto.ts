import { IsEnum, IsOptional, IsUUID } from 'class-validator'

import { FlatStatus, FlatType } from '../../database/entities/flat.entity'

export class UpdateFlatDto {
  @IsOptional()
  @IsUUID()
  wingId?: string

  @IsOptional()
  @IsEnum(FlatType)
  type?: FlatType

  @IsOptional()
  @IsEnum(FlatStatus)
  status?: FlatStatus

  @IsOptional()
  @IsUUID()
  ownerId?: string
}
