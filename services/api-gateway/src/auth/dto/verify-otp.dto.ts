import { IsEnum, IsString, Length, Matches } from 'class-validator'

import { UserRole } from '@society/shared-types'

export class VerifyOtpDto {
  @IsString()
  @Matches(/^\+?[1-9]\d{6,14}$/, { message: 'phone must be a valid E.164 number' })
  phone!: string

  @IsString()
  @Length(6, 6)
  @Matches(/^\d{6}$/, { message: 'otp must be exactly 6 digits' })
  otp!: string

  @IsEnum(UserRole)
  role!: UserRole
}
