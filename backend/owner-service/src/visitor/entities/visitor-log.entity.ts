import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

/**
 * VisitorStatus — state machine for a single visitor visit.
 *
 *  PENDING  → owner has not yet approved/denied
 *  APPROVED → owner approved; visitor may enter
 *  DENIED   → owner denied or 2-minute timeout expired (EPIC-04)
 *  INSIDE   → visitor entered and is currently inside
 *  EXITED   → visitor has left (exit recorded by guard)
 */
export enum VisitorStatus {
  PENDING  = 'PENDING',
  APPROVED = 'APPROVED',
  DENIED   = 'DENIED',
  INSIDE   = 'INSIDE',
  EXITED   = 'EXITED',
}

/**
 * VisitorLog — one row per visit attempt.
 *
 * PII storage strategy (EPIC-02):
 *   phoneEncrypted  — AES-256-GCM ciphertext; decrypted only by admin endpoint
 *   phoneHash       — HMAC-SHA256(E.164, HMAC_KEY); used for block-list lookup
 *
 * The plain-text phone is NEVER stored.
 */
@Entity('visitor_logs')
@Index(['societyId', 'status'])          // admin dashboard filter
@Index(['flatId', 'createdAt'])          // owner history view
export class VisitorLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  /** Multi-tenant discriminator — every query must include this */
  @Column({ type: 'uuid' })
  societyId!: string

  /** Flat the visitor was heading to */
  @Column({ type: 'uuid' })
  flatId!: string

  @Column()
  visitorName!: string

  /**
   * AES-256-GCM encrypted phone (ciphertext + IV + auth-tag, base64).
   * select: false — never returned by default SELECT queries.
   * Decryption requires a KMS-managed DEK (EPIC-02).
   */
  @Column({ select: false })
  phoneEncrypted!: string

  /**
   * HMAC-SHA256(E.164 phone, HMAC_KEY) stored as hex.
   * Deterministic — used to match visitor against block-list without decrypting.
   */
  @Column()
  @Index()
  phoneHash!: string

  @Column({ nullable: true, type: 'varchar' })
  vehicleNumber!: string | null

  @Column()
  purpose!: string

  @Column({ type: 'enum', enum: VisitorStatus, default: VisitorStatus.PENDING })
  status!: VisitorStatus

  /** S3 object key for the entry photo taken by the guard */
  @Column({ nullable: true, type: 'varchar' })
  entryPhotoKey!: string | null

  /** UUID of the owner who approved or null if pending/denied */
  @Column({ nullable: true, type: 'uuid' })
  approvedByOwnerId!: string | null

  @Column({ nullable: true, type: 'timestamptz' })
  entryAt!: Date | null

  @Column({ nullable: true, type: 'timestamptz' })
  exitAt!: Date | null

  /** GDPR consent for storing visitor photo and personal data (EPIC-20) */
  @Column({ default: false })
  gdprConsentGiven!: boolean

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date

  /** Soft-delete — GDPR erasure sets deletedAt instead of dropping the row */
  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt!: Date | null
}
