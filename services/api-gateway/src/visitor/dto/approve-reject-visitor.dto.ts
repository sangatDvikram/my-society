import { IsUUID } from 'class-validator'

export class ApproveRejectVisitorDto {
  @IsUUID()
  ownerId!: string
}
