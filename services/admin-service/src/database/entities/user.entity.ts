import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  INVITED = 'INVITED',
}

export enum StaffSubRole {
  GUARD = 'GUARD',
  MAINTENANCE_STAFF = 'MAINTENANCE_STAFF',
  ACCOUNTANT = 'ACCOUNTANT',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Index()
  @Column({ type: 'uuid', nullable: true })
  societyId!: string

  @Column({ type: 'uuid', nullable: true })
  flatId!: string

  /** OWNER | ADMIN | SUPER_ADMIN | STAFF | GUARD */
  @Column({ length: 20 })
  role!: string

  /** Sub-role for STAFF: GUARD | MAINTENANCE_STAFF | ACCOUNTANT */
  @Column({ type: 'enum', enum: StaffSubRole, nullable: true })
  staffSubRole!: StaffSubRole | null

  /** AES-256-GCM encrypted phone — never display raw */
  @Column({ type: 'bytea', nullable: true })
  phoneEncrypted!: Buffer

  /** HMAC-SHA256 deterministic hash — for lookups only */
  @Index()
  @Column({ nullable: true })
  phoneHash!: string

  @Column({ length: 255, nullable: true })
  name!: string

  @Column({ length: 255, nullable: true })
  email!: string

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.INVITED })
  status!: UserStatus

  /** TOTP secret for SUPER_ADMIN 2FA — stored encrypted */
  @Column({ nullable: true })
  totpSecret!: string

  /** FCM device token for push notifications */
  @Column({ nullable: true })
  fcmToken!: string

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt!: Date
}
