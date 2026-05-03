import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

/** Stub entity — full implementation in media-service (EPIC-13). */
@Entity('media_assets')
export class MediaAsset {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'uuid', nullable: true })
  societyId: string

  /** Original object storage key */
  @Column()
  originalKey: string

  /** JPEG | PNG | WEBP | MP4 | MOV */
  @Column({ nullable: true })
  mimeType: string

  @Column({ type: 'int', nullable: true })
  originalWidth: number

  @Column({ type: 'int', nullable: true })
  originalHeight: number

  /** File size in bytes */
  @Column({ type: 'bigint', nullable: true })
  fileSize: number

  /**
   * Context tag e.g. 'event_media' | 'facility_photo' | 'vendor_document'
   */
  @Column({ nullable: true })
  contextType: string

  /** ACTIVE | REMOVED | PROCESSING */
  @Column({ default: 'ACTIVE' })
  status: string

  /** JSONB map of generated ImageVariant objects keyed by paramsHash */
  @Column({ type: 'jsonb', nullable: true })
  variants: Record<string, unknown>

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
