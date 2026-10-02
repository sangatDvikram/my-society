import { IsString, IsUUID, Length } from 'class-validator'

export class PreApprovedEntryDto {
  @IsUUID()
  societyId!: string

  @IsString()
  @Length(6, 6)
  token!: string

  @IsUUID()
  entryGuardId!: string
}
