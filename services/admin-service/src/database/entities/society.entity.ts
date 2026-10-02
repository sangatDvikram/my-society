import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

export enum SocietyStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export enum SubscriptionTier {
  FREE = 'FREE',
  BASIC = 'BASIC',
  PRO = 'PRO',
  ENTERPRISE = 'ENTERPRISE',
}

@Entity('societies')
export class Society {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ length: 255 })
  name!: string

  @Column({ length: 512, nullable: true })
  address!: string

  @Column({ length: 100, nullable: true })
  city!: string

  @Column({ length: 100, nullable: true })
  state!: string

  @Column({ length: 10, nullable: true })
  pincode!: string

  @Column({ length: 50, default: 'India' })
  country!: string

  @Column({ type: 'enum', enum: SocietyStatus, default: SocietyStatus.ACTIVE })
  status!: SocietyStatus

  @Column({ type: 'enum', enum: SubscriptionTier, default: SubscriptionTier.FREE })
  subscriptionTier!: SubscriptionTier

  @Column({ type: 'int', default: 0 })
  totalFlats!: number

  @Column({ type: 'int', default: 0 })
  totalWings!: number

  @Column({ nullable: true })
  logoImageId!: string

  @Column({ type: 'varchar', length: 50, nullable: true })
  timezone!: string

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt!: Date
}
