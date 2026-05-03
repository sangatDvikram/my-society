import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

/** Stub entity — full implementation in EPIC-06. */
@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'uuid' })
  societyId: string

  @Column({ type: 'uuid', nullable: true })
  flatId: string

  @Column({ type: 'uuid', nullable: true })
  userId: string

  /** Amount in paise */
  @Column({ type: 'bigint', default: 0 })
  amount: number

  /** SUCCESS | FAILED | PENDING | REFUNDED */
  @Column({ default: 'PENDING' })
  status: string

  /** MAINTENANCE | FACILITY_BOOKING | LATE_FEE | OTHER */
  @Column({ nullable: true })
  type: string

  @Column({ nullable: true })
  razorpayOrderId: string

  @Column({ nullable: true })
  razorpayPaymentId: string

  /** Never expose to UI — Section 16.9 */
  @Column({ nullable: true })
  razorpaySignature: string

  @Column({ nullable: true })
  description: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
