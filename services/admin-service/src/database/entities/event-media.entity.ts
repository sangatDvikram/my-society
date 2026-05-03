import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

/** Stub entity — full implementation in EPIC-13. */
@Entity('event_media')
export class EventMedia {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'uuid' })
  societyId: string

  @Column({ type: 'uuid' })
  eventId: string

  @Column({ type: 'uuid' })
  uploadedById: string

  /** PHOTO | VIDEO */
  @Column()
  mediaType: string

  /** ACTIVE | REMOVED */
  @Column({ default: 'ACTIVE' })
  status: string

  @Column()
  objectKey: string

  @Column({ nullable: true })
  thumbnailKey: string

  @Column({ nullable: true })
  mimeType: string

  /** File size in bytes */
  @Column({ type: 'bigint', nullable: true })
  fileSize: number

  @Column({ nullable: true, type: 'text' })
  moderationReason: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
