import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches,
} from 'class-validator'

export class CreateVisitorLogDto {
  @IsUUID()
  societyId!: string

  @IsUUID()
  hostFlatId!: string

  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  visitorName!: string

  @IsString()
  @Matches(/^\+[1-9]\d{6,14}$/, { message: 'visitorPhone must be a valid E.164 number' })
  visitorPhone!: string

  @IsString()
  @IsOptional()
  @Length(1, 255)
  purpose!: string

  @IsString()
  @IsOptional()
  @Length(1, 20)
  vehicleNumber?: string

  @IsBoolean()
  @IsOptional()
  gdprConsent?: boolean

  /** UUID of the guard creating the entry */
  @IsUUID()
  entryGuardId!: string
}
