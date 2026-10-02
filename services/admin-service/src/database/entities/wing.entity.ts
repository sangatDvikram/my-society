import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

@Entity('wings')
@Index(['societyId', 'name'], { unique: true })
export class Wing {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Index()
  @Column({ type: 'uuid' })
  societyId!: string

  @Column({ length: 50 })
  name!: string

  @Column({ length: 255, nullable: true })
  description!: string

  @Column({ type: 'int', default: 0 })
  totalFloors!: number

  @Column({ type: 'int', default: 0 })
  totalFlats!: number

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt!: Date
}
