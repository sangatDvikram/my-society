import { Module } from '@nestjs/common'
import { ClientsModule, Transport } from '@nestjs/microservices'
import { VisitorProxyController } from './visitor-proxy.controller'
import { VisitorProxyService } from './visitor-proxy.service'

/**
 * VisitorProxyModule
 *
 * Registers the TCP client that connects to owner-service.
 * The injection token 'OWNER_SERVICE' is used by VisitorProxyService
 * to obtain a ClientProxy instance.
 *
 * Configuration is driven by env vars so the same build works in every
 * environment — dev, staging, and production.
 *
 * Env vars (set in .env or Kubernetes secrets):
 *   OWNER_SERVICE_HOST     — owner-service hostname  (default: localhost)
 *   OWNER_SERVICE_TCP_PORT — owner-service TCP port  (default: 8877)
 */
@Module({
  imports: [
    ClientsModule.register([
      {
        /**
         * Injection token — used in VisitorProxyService constructor:
         *   @Inject('OWNER_SERVICE') private readonly ownerClient: ClientProxy
         */
        name: 'OWNER_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env['OWNER_SERVICE_HOST'] ?? 'localhost',
          port: parseInt(process.env['OWNER_SERVICE_TCP_PORT'] ?? '8877', 10),
        },
      },
    ]),
  ],
  controllers: [VisitorProxyController],
  providers: [VisitorProxyService],
})
export class VisitorProxyModule {}
