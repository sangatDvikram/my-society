import { IsNotEmpty, IsOptional, IsString, IsUUID, Length } from 'class-validator'

export class PreApproveVisitorDto {
  @IsUUID()
  societyId!: string

  @IsUUID()
  hostFlatId!: string

  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  visitorName!: string

  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  purpose!: string

  @IsString()
  @IsOptional()
  @Length(1, 20)
  vehicleNumber?: string
}
