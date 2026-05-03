import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

/** Stub entity — full implementation in EPIC-12. */
@Entity('society_events')
export class SocietyEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'uuid' })
  societyId: string

  @Column({ type: 'uuid' })
  createdById: string

  /** OWNER | ADMIN */
  @Column({ nullable: true })
  createdByRole: string

  @Column()
  title: string

  @Column({ nullable: true, type: 'text' })
  description: string

  /** Extensible varchar — CULTURAL | SPORTS | MAINTENANCE | AGM | … */
  @Column({ nullable: true })
  eventType: string

  /** DRAFT | UPCOMING | ONGOING | COMPLETED | CANCELLED | REMOVED */
  @Column({ default: 'DRAFT' })
  status: string

  @Column({ type: 'boolean', default: false })
  isPinned: boolean

  @Column({ type: 'timestamptz', nullable: true })
  startDatetime: Date

  @Column({ type: 'timestamptz', nullable: true })
  endDatetime: Date

  @Column({ nullable: true })
  venue: string

  @Column({ type: 'int', nullable: true })
  maxParticipants: number

  @Column({ type: 'uuid', nullable: true })
  linkedFacilityBookingId: string

  @Column({ nullable: true, type: 'text' })
  removalReason: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @DeleteDateColumn()
  deletedAt: Date
}
