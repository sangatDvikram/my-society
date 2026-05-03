import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

/** Stub entity — full implementation in EPIC-03. */
@Entity('flats')
export class Flat {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'uuid' })
  societyId: string

  @Column()
  flatNumber: string

  @Column({ nullable: true })
  wing: string

  @Column({ nullable: true })
  floor: string

  @Column({ nullable: true })
  type: string

  /** OCCUPIED | VACANT | UNDER_RENOVATION | RENTED */
  @Column({ default: 'VACANT' })
  status: string

  @Column({ type: 'uuid', nullable: true })
  ownerId: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
