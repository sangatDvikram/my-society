import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { DatabaseModule } from './database/database.module'
import { VisitorModule } from './visitor/visitor.module'

/**
 * AppModule — root module of owner-service.
 *
 * Import order:
 *   DatabaseModule  — TypeORM PostgreSQL connection (shared by all domain modules)
 *   VisitorModule   — Visitor log @MessagePattern + @EventPattern handlers
 *
 * As new domain modules are added (maintenance, payments, facilities …)
 * they are imported here in the same pattern.
 */
@Module({
  imports: [
    DatabaseModule,
    VisitorModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
