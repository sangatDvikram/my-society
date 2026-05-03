import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

/** Stub entity — full implementation in EPIC-07. */
@Entity('audit_reports')
export class AuditReport {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'uuid' })
  societyId: string

  /** SOCIETY_ANNUAL | OWNER_STATEMENT */
  @Column()
  reportType: string

  /** Financial year e.g. "2025-2026" */
  @Column()
  financialYear: string

  /** PENDING | GENERATING | DRAFT | PUBLISHED | ARCHIVED | FAILED */
  @Column({ default: 'PENDING' })
  status: string

  /** Version number (incremented on regeneration) */
  @Column({ type: 'int', default: 1 })
  version: number

  /** Object storage key for the PDF */
  @Column({ nullable: true })
  objectKey: string

  /** SHA-256 checksum of the PDF */
  @Column({ nullable: true })
  checksum: string

  @Column({ type: 'uuid', nullable: true })
  generatedById: string

  @Column({ type: 'timestamptz', nullable: true })
  publishedAt: Date

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
