import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
} from 'class-validator'

/**
 * CreateVisitorLogDto — mirrors the DTO validated by api-gateway.
 *
 * owner-service receives this object over TCP after api-gateway has
 * already validated and normalised the phone to E.164 format.
 *
 * owner-service applies its own validation as a defence-in-depth measure
 * (the TCP channel is internal but we still validate to catch bugs early).
 */
export class CreateVisitorLogDto {
  @IsUUID()
  societyId!: string

  @IsUUID()
  flatId!: string

  @IsString()
  @IsNotEmpty()
  visitorName!: string

  /** E.164 normalised phone — api-gateway ensures this format before sending */
  @IsString()
  @Matches(/^\+[1-9]\d{6,14}$/, {
    message: 'visitorPhone must be a valid E.164 number',
  })
  visitorPhone!: string

  @IsString()
  @IsOptional()
  vehicleNumber?: string

  @IsString()
  @IsNotEmpty()
  purpose!: string

  @IsBoolean()
  @IsOptional()
  gdprConsentGiven?: boolean
}
