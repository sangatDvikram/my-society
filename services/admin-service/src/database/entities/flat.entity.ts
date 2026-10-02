import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

export enum FlatStatus {
  OCCUPIED = 'OCCUPIED',
  VACANT = 'VACANT',
  UNDER_RENOVATION = 'UNDER_RENOVATION',
  RENTED = 'RENTED',
}

export enum FlatType {
  ONE_BHK = '1BHK',
  TWO_BHK = '2BHK',
  THREE_BHK = '3BHK',
  FOUR_BHK = '4BHK',
  PENTHOUSE = 'PENTHOUSE',
  STUDIO = 'STUDIO',
  OTHER = 'OTHER',
}

@Entity('flats')
@Index(['societyId', 'flatNumber'], { unique: true })
export class Flat {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Index()
  @Column({ type: 'uuid' })
  societyId!: string

  @Column({ type: 'uuid', nullable: true })
  wingId!: string

  @Column({ type: 'uuid', nullable: true })
  ownerId!: string

  @Column({ length: 20 })
  flatNumber!: string

  @Column({ type: 'int', nullable: true })
  floor!: number

  @Column({ type: 'enum', enum: FlatType, nullable: true })
  type!: FlatType

  @Column({ type: 'enum', enum: FlatStatus, default: FlatStatus.VACANT })
  status!: FlatStatus

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  areaSqFt!: number

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt!: Date
}
