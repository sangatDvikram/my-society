import { IsInt, IsOptional, IsString, IsUUID, Length, Max, Min } from 'class-validator'

export class CreateWingDto {
  @IsUUID()
  societyId!: string

  @IsString()
  @Length(1, 50)
  name!: string

  @IsOptional()
  @IsString()
  @Length(0, 255)
  description?: string

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  totalFloors?: number
}
