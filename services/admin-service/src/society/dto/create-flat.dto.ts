import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Max,
  Min,
} from 'class-validator'

import { FlatType } from '../../database/entities/flat.entity'

export class CreateFlatDto {
  @IsUUID()
  societyId!: string

  @IsOptional()
  @IsUUID()
  wingId?: string

  @IsString()
  @Length(1, 20)
  flatNumber!: string

  @IsOptional()
  @IsInt()
  @Min(-2)
  @Max(200)
  floor?: number

  @IsOptional()
  @IsEnum(FlatType)
  type?: FlatType

  @IsOptional()
  @IsNumber()
  @Min(0)
  areaSqFt?: number
}
