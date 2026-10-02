import { IsUUID } from 'class-validator'

export class RecordExitDto {
  @IsUUID()
  visitorLogId!: string

  @IsUUID()
  exitGuardId!: string
}
