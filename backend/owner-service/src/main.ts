import 'reflect-metadata'
import { Logger, ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { type MicroserviceOptions, Transport } from '@nestjs/microservices'

import { AppModule } from './app.module'

/**
 * owner-service bootstrap — Hybrid NestJS application.
 *
 * Hybrid means the process runs TWO servers simultaneously:
 *
 *  1. HTTP server  (port 3001) — direct health checks, admin tooling
 *  2. TCP server   (port 8877) — receives messages from api-gateway via
 *                                NestJS ClientProxy (Transport.TCP)
 *
 * The TCP server handles:
 *   @MessagePattern('visitor.create') — request/response
 *   @EventPattern('visitor.exit')     — fire-and-forget
 *
 * Call order matters:
 *   connectMicroservice() → registers the TCP listener config
 *   startAllMicroservices() → binds the TCP port (must be before listen())
 *   listen() → binds the HTTP port
 */
async function bootstrap(): Promise<void> {
  // 1. Create the hybrid application (platform-express for HTTP)
  const app = await NestFactory.create(AppModule)

  // 2. Register the TCP microservice transport
  //    api-gateway connects here to send MessagePattern / EventPattern messages
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: parseInt(process.env['TCP_PORT'] ?? '8877', 10),
    },
  })

  // 3. Global ValidationPipe — validates DTOs received over TCP as well as HTTP
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )

  // 4. Start TCP listener BEFORE the HTTP server
  await app.startAllMicroservices()

  // 5. Start HTTP server
  app.setGlobalPrefix('api/v1')
  app.enableShutdownHooks()

  const httpPort = process.env['PORT']     ?? 3001
  const tcpPort  = process.env['TCP_PORT'] ?? 8877

  await app.listen(httpPort)

  const logger = new Logger('Bootstrap')
  logger.log(`[owner-service] HTTP → http://localhost:${httpPort}/api/v1`)
  logger.log(`[owner-service] TCP  → tcp://0.0.0.0:${tcpPort}`)
}

void bootstrap()
