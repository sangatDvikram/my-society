import { IsString, Length, Matches } from 'class-validator'

export class VerifyTotpDto {
  @IsString()
  @Length(6, 6)
  @Matches(/^\d{6}$/, { message: 'totp must be exactly 6 digits' })
  totp!: string
}
