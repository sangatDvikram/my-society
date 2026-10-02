import { IsEnum, IsOptional, IsString, Length } from 'class-validator'

import { SubscriptionTier } from '../../database/entities/society.entity'

export class CreateSocietyDto {
  @IsString()
  @Length(2, 255)
  name!: string

  @IsOptional()
  @IsString()
  @Length(0, 512)
  address?: string

  @IsOptional()
  @IsString()
  @Length(0, 100)
  city?: string

  @IsOptional()
  @IsString()
  @Length(0, 100)
  state?: string

  @IsOptional()
  @IsString()
  @Length(6, 10)
  pincode?: string

  @IsOptional()
  @IsString()
  @Length(0, 50)
  country?: string

  @IsOptional()
  @IsEnum(SubscriptionTier)
  subscriptionTier?: SubscriptionTier

  @IsOptional()
  @IsString()
  timezone?: string
}
