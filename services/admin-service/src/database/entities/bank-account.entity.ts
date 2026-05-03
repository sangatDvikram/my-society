import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

/** Stub entity — full implementation in EPIC-08. */
@Entity('society_bank_accounts')
export class SocietyBankAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'uuid' })
  societyId: string

  /** AES-256-GCM encrypted — never display raw */
  @Column({ nullable: true })
  accountNumberEncrypted: string

  /** Last 4 digits for masked display */
  @Column({ nullable: true })
  accountNumberLast4: string

  @Column({ nullable: true })
  ifsc: string

  @Column({ nullable: true })
  bankName: string

  @Column({ nullable: true })
  accountHolderName: string

  /** SAVINGS | CURRENT */
  @Column({ nullable: true })
  accountType: string

  /** PENDING_VERIFICATION | VERIFIED | VERIFICATION_FAILED | INACTIVE */
  @Column({ default: 'PENDING_VERIFICATION' })
  status: string

  @Column({ type: 'boolean', default: false })
  isPrimary: boolean

  @Column({ nullable: true })
  razorpayContactId: string

  @Column({ nullable: true })
  razorpayFundAccountId: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
