import { IsHexadecimal, Length } from 'class-validator'

export class RotateKeyDto {
  /** New 32-byte key as a 64-character hex string */
  @IsHexadecimal()
  @Length(64, 64)
  newKeyHex!: string
}
