import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

/** Stub entity — full implementation in EPIC-03. */
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'uuid', nullable: true })
  societyId: string

  /** OWNER | ADMIN | SUPER_ADMIN | STAFF | GUARD */
  @Column()
  role: string

  /** AES-256-GCM encrypted phone — never display raw */
  @Column({ nullable: true })
  phoneEncrypted: string

  /** HMAC-SHA256 deterministic hash — for lookups only */
  @Column({ nullable: true })
  phoneHash: string

  @Column({ nullable: true })
  name: string

  @Column({ nullable: true })
  email: string

  @Column({ default: 'ACTIVE' })
  status: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @DeleteDateColumn()
  deletedAt: Date
}
