import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

/** Stub entity — full implementation in EPIC-03 / EPIC-18. */
@Entity('feature_flags')
export class FeatureFlag {
  @PrimaryGeneratedColumn('uuid')
  id: string

  /** null = global; UUID = society-specific override */
  @Column({ type: 'uuid', nullable: true })
  societyId: string

  @Column()
  key: string

  @Column({ type: 'boolean', default: false })
  enabled: boolean

  @Column({ nullable: true, type: 'text' })
  description: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
