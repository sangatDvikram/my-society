import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

/** Stub entity — full implementation in EPIC-04. */
@Entity('visitor_logs')
export class VisitorLog {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'uuid' })
  societyId: string

  @Column({ type: 'uuid', nullable: true })
  flatId: string

  @Column()
  visitorName: string

  /** AES-256-GCM encrypted phone */
  @Column({ nullable: true })
  phoneEncrypted: string

  @Column({ nullable: true })
  phoneHash: string

  /** PENDING | APPROVED | REJECTED | DENIED_TIMEOUT */
  @Column({ default: 'PENDING' })
  approvalStatus: string

  /** WALK_IN | PRE_APPROVED | STAFF */
  @Column({ nullable: true })
  entryType: string

  @Column({ nullable: true })
  purpose: string

  @Column({ nullable: true })
  vehicleNumber: string

  @Column({ nullable: true })
  photoKey: string

  @Column({ type: 'boolean', default: false })
  gdprConsent: boolean

  @Column({ type: 'timestamptz', nullable: true })
  entryAt: Date

  @Column({ type: 'timestamptz', nullable: true })
  exitAt: Date

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @DeleteDateColumn()
  deletedAt: Date
}
