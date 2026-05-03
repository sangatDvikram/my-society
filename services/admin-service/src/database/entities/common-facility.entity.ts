import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

/** Stub entity — full implementation in EPIC-10. */
@Entity('common_facilities')
export class CommonFacility {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'uuid' })
  societyId: string

  @Column()
  name: string

  @Column({ nullable: true, type: 'text' })
  description: string

  @Column({ type: 'int', default: 1 })
  capacity: number

  /** ACTIVE | INACTIVE */
  @Column({ default: 'ACTIVE' })
  status: string

  /** FIXED | HOURLY | VARIABLE */
  @Column({ nullable: true })
  pricingModel: string

  /** Price in paise for fixed/hourly; JSON schedule for variable */
  @Column({ type: 'jsonb', nullable: true })
  pricingConfig: Record<string, unknown>

  /** Object storage keys for facility photos (max 10) */
  @Column({ type: 'jsonb', nullable: true })
  photoS3Keys: string[]

  /** Max days in advance a booking can be made */
  @Column({ type: 'int', nullable: true })
  maxAdvanceDays: number

  /** Min hours before slot start that booking must be made */
  @Column({ type: 'int', nullable: true })
  minAdvanceHours: number

  /** JSON cancellation policy */
  @Column({ type: 'jsonb', nullable: true })
  cancellationPolicy: Record<string, unknown>

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
