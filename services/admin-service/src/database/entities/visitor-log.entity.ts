import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

export enum VisitorStatus {
  PENDING  = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  TIMEOUT  = 'TIMEOUT',
  INSIDE   = 'INSIDE',
  EXITED   = 'EXITED',
}

@Entity('visitor_logs')
@Index(['societyId', 'entryTime'])
@Index(['visitorPhoneHash'])
export class VisitorLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ type: 'uuid' })
  societyId!: string

  @Column({ type: 'uuid' })
  hostFlatId!: string

  @Column({ length: 255 })
  visitorName!: string

  @Column({ type: 'bytea', nullable: true, select: false })
  visitorPhoneEncrypted!: Buffer | null

  @Index()
  @Column({ length: 64, nullable: true })
  visitorPhoneHash!: string | null

  @Column({ length: 20, nullable: true })
  vehicleNumber!: string | null

  @Column({ length: 255 })
  purpose!: string

  @Column({ type: 'enum', enum: VisitorStatus, default: VisitorStatus.PENDING })
  status!: VisitorStatus

  @Column({ type: 'uuid', nullable: true })
  entryGuardId!: string | null

  @Column({ type: 'uuid', nullable: true })
  exitGuardId!: string | null

  @Column({ length: 36, nullable: true })
  photoImageId!: string | null

  /** Satisfies both GDPR consent and DPDP notice-and-consent requirements */
  @Column({ default: false })
  gdprConsent!: boolean

  @Column({ type: 'timestamptz', nullable: true })
  entryTime!: Date | null

  @Column({ type: 'timestamptz', nullable: true })
  exitTime!: Date | null

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt!: Date | null
}
