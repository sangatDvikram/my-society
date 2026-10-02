import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

@Entity('society_configs')
export class SocietyConfig {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Index({ unique: true })
  @Column({ type: 'uuid' })
  societyId!: string

  /** Visitor hours: 24h format "HH:MM", null = unrestricted */
  @Column({ length: 5, nullable: true })
  visitorStartTime!: string

  @Column({ length: 5, nullable: true })
  visitorEndTime!: string

  /** Max vehicles allowed per flat */
  @Column({ type: 'int', default: 2 })
  parkingLimitPerFlat!: number

  /** Hours after which a visitor is flagged as long-stay (default 4h) */
  @Column({ type: 'int', default: 4 })
  visitorLongStayAlertHours!: number

  /** SLA timers per maintenance category — JSON: { [category]: hours } */
  @Column({ type: 'jsonb', default: '{}' })
  maintenanceSlaHours!: Record<string, number>

  /** Late fee config — JSON: { type: 'flat'|'percent', value: number } */
  @Column({ type: 'jsonb', nullable: true })
  lateFeeConfig!: { type: 'flat' | 'percent'; value: number } | null

  /** Day of month maintenance invoice is auto-generated (default 1) */
  @Column({ type: 'int', default: 1 })
  invoiceDayOfMonth!: number

  /** Allowed countries for access (empty = all allowed) */
  @Column({ type: 'simple-array', nullable: true })
  allowedCountries!: string[]

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date
}
