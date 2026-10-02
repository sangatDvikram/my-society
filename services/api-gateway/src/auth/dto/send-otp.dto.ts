import { IsEnum, IsString, Matches } from 'class-validator'

import { UserRole } from '@society/shared-types'

export class SendOtpDto {
  @IsString()
  @Matches(/^\+?[1-9]\d{6,14}$/, { message: 'phone must be a valid E.164 number' })
  phone!: string

  @IsEnum(UserRole)
  role!: UserRole
}
