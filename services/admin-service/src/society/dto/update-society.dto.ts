import { IsEnum, IsOptional, IsString, Length } from 'class-validator'

import { SocietyStatus, SubscriptionTier } from '../../database/entities/society.entity'

export class UpdateSocietyDto {
  @IsOptional()
  @IsString()
  @Length(2, 255)
  name?: string

  @IsOptional()
  @IsString()
  address?: string

  @IsOptional()
  @IsString()
  city?: string

  @IsOptional()
  @IsString()
  state?: string

  @IsOptional()
  @IsString()
  pincode?: string

  @IsOptional()
  @IsString()
  country?: string

  @IsOptional()
  @IsEnum(SocietyStatus)
  status?: SocietyStatus

  @IsOptional()
  @IsEnum(SubscriptionTier)
  subscriptionTier?: SubscriptionTier

  @IsOptional()
  @IsString()
  timezone?: string
}
