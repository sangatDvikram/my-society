import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

/**
 * DatabaseModule — Configures TypeORM with PostgreSQL for the owner-service.
 *
 * All configuration is driven by environment variables so that the same
 * Docker image runs in dev, staging, and production without rebuilding.
 *
 * Required env vars:
 *   DB_HOST     — PostgreSQL host           (default: localhost)
 *   DB_PORT     — PostgreSQL port           (default: 5432)
 *   DB_USERNAME — Database user             (default: postgres)
 *   DB_PASSWORD — Database password         (required in production)
 *   DB_NAME     — Database name             (default: owner_service_db)
 *
 * Entities are registered per-feature via TypeOrmModule.forFeature([]) in
 * each domain module — they are auto-loaded via the entities glob pattern.
 */
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host:     process.env['DB_HOST']     ?? 'localhost',
      port:     parseInt(process.env['DB_PORT'] ?? '5432', 10),
      username: process.env['DB_USERNAME'] ?? 'postgres',
      password: process.env['DB_PASSWORD'] ?? '',
      database: process.env['DB_NAME']     ?? 'owner_service_db',

      // Auto-discover all entities defined in the src tree
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],

      // DANGER: synchronize: true is only safe in development.
      // Use TypeORM migrations in staging/production.
      synchronize: process.env['NODE_ENV'] !== 'production',

      // Logging slows down hot-reload; enable only in debug mode
      logging: process.env['DB_LOGGING'] === 'true',

      ssl: process.env['DB_SSL'] === 'true'
        ? { rejectUnauthorized: false }
        : false,
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
