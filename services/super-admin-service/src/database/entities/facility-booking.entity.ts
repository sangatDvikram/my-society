import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

/** Stub entity — full implementation in EPIC-10. */
@Entity('facility_bookings')
export class FacilityBooking {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'uuid' })
  societyId: string

  @Column({ type: 'uuid' })
  facilityId: string

  @Column({ type: 'uuid' })
  ownerId: string

  /**
   * PENDING_APPROVAL | APPROVED | CONFIRMED | REJECTED | CANCELLED
   */
  @Column({ default: 'PENDING_APPROVAL' })
  status: string

  @Column({ type: 'timestamptz', nullable: true })
  slotStart: Date

  @Column({ type: 'timestamptz', nullable: true })
  slotEnd: Date

  /** Total fee in paise */
  @Column({ type: 'bigint', nullable: true })
  feeAmount: number

  @Column({ type: 'uuid', nullable: true })
  paymentId: string

  @Column({ nullable: true, type: 'text' })
  rejectionReason: string

  @Column({ nullable: true, type: 'text' })
  cancellationReason: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
