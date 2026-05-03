import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

/** Stub entity — full implementation in EPIC-09. */
@Entity('flat_rentals')
export class FlatRental {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'uuid' })
  societyId: string

  @Column({ type: 'uuid' })
  flatId: string

  @Column({ type: 'uuid' })
  tenantProfileId: string

  @Column({ type: 'uuid' })
  ownerId: string

  /** ACTIVE | ENDED | EXPIRED */
  @Column({ default: 'ACTIVE' })
  status: string

  @Column({ type: 'date', nullable: true })
  agreementStartDate: string

  @Column({ type: 'date', nullable: true })
  agreementEndDate: string

  /** Rent amount in paise */
  @Column({ type: 'bigint', nullable: true })
  rentAmount: number

  @Column({ nullable: true })
  rentFrequency: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
