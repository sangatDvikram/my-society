import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm'

/**
 * AdminAuditLog — persists every AdminJS panel action for compliance.
 * Written via the global after() hook in adminjs.options.ts.
 *
 * Section 16.8 of the PRD.
 */
@Entity('admin_audit_logs')
export class AdminAuditLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  /** ID of the admin who performed the action */
  @Column({ type: 'uuid' })
  adminId!: string

  @Column()
  adminEmail!: string

  /** 'new' | 'edit' | 'delete' | 'bulkDelete' | custom action name */
  @Column()
  action!: string

  /** Entity name (e.g. 'Society', 'Payment') */
  @Column()
  resource!: string

  /** Primary key of the affected record */
  @Column({ type: 'uuid', nullable: true })
  recordId!: string

  /** Before/after diff of changed fields */
  @Column({ type: 'jsonb', nullable: true })
  changedFields!: Record<string, { from: unknown; to: unknown }>

  @Column({ nullable: true })
  ipAddress!: string

  @Column({ nullable: true })
  userAgent!: string

  @CreateDateColumn()
  createdAt!: Date
}
