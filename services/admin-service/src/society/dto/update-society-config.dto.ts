import { Type } from 'class-transformer'
import { IsArray, IsInt, IsOptional, IsString, Max, Min, ValidateNested } from 'class-validator'

class LateFeeConfigDto {
  @IsString()
  type!: 'flat' | 'percent'

  @IsInt()
  @Min(0)
  value!: number
}

export class UpdateSocietyConfigDto {
  @IsOptional()
  @IsString()
  visitorStartTime?: string

  @IsOptional()
  @IsString()
  visitorEndTime?: string

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10)
  parkingLimitPerFlat?: number

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(72)
  visitorLongStayAlertHours?: number

  @IsOptional()
  maintenanceSlaHours?: Record<string, number>

  @IsOptional()
  @ValidateNested()
  @Type(() => LateFeeConfigDto)
  lateFeeConfig?: LateFeeConfigDto

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(28)
  invoiceDayOfMonth?: number

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedCountries?: string[]
}
