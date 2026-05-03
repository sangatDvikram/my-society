import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

/** Stub entity — full implementation in EPIC-09. */
@Entity('tenant_profiles')
export class TenantProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'uuid' })
  societyId: string

  @Column()
  name: string

  /** AES-256-GCM encrypted phone — never display raw */
  @Column({ nullable: true })
  tenantPhoneEncrypted: string

  @Column({ nullable: true })
  tenantPhoneHash: string

  /** AES-256-GCM encrypted PAN — never display raw */
  @Column({ nullable: true })
  panEncrypted: string

  /** Last 4 chars for masked display */
  @Column({ nullable: true })
  panLast4: string

  @Column({ nullable: true })
  email: string

  @Column({ nullable: true })
  permanentAddress: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @DeleteDateColumn()
  deletedAt: Date
}
