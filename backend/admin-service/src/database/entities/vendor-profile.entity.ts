import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

/** Stub entity — full implementation in EPIC-11. */
@Entity('vendor_profiles')
export class VendorProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'uuid' })
  societyId: string

  @Column()
  businessName: string

  @Column()
  ownerName: string

  /** Extensible varchar enum — PLUMBER | ELECTRICIAN | CARPENTER | … */
  @Column()
  serviceCategory: string

  /** AES-256-GCM encrypted phone */
  @Column({ nullable: true })
  phoneEncrypted: string

  @Column({ nullable: true })
  phoneHash: string

  /** Last 4 digits for masked display */
  @Column({ nullable: true })
  phoneLast4: string

  @Column({ nullable: true })
  email: string

  @Column({ nullable: true, type: 'text' })
  address: string

  @Column({ nullable: true, type: 'text' })
  description: string

  /** ACTIVE | INACTIVE | DELETED */
  @Column({ default: 'ACTIVE' })
  status: string

  @Column({ type: 'date', nullable: true })
  empanelledAt: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @DeleteDateColumn()
  deletedAt: Date
}
