import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
} from 'class-validator'

/**
 * CreateVisitorLogDto — validated at the api-gateway HTTP boundary.
 *
 * The raw phone is normalised to E.164 by the gateway before forwarding
 * to owner-service.  owner-service will encrypt it (EPIC-02).
 */
export class CreateVisitorLogDto {
  /** Target society (from JWT claims in a real flow) */
  @IsUUID()
  societyId!: string

  /** Flat the visitor is heading to */
  @IsUUID()
  flatId!: string

  @IsString()
  @IsNotEmpty()
  visitorName!: string

  /**
   * E.164 phone number — e.g. +919876543210
   * Guard terminal captures the raw number; gateway normalises it here.
   */
  @IsString()
  @Matches(/^\+[1-9]\d{6,14}$/, {
    message: 'visitorPhone must be a valid E.164 number (e.g. +919876543210)',
  })
  visitorPhone!: string

  @IsString()
  @IsOptional()
  vehicleNumber?: string

  @IsString()
  @IsNotEmpty()
  purpose!: string

  /** GDPR consent captured at the gate terminal */
  @IsBoolean()
  @IsOptional()
  gdprConsentGiven?: boolean
}
