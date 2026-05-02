import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule)

  // Global prefix for all API routes
  app.setGlobalPrefix('api/v1')

  // Enable graceful shutdown hooks
  app.enableShutdownHooks()

  const port = process.env['PORT'] ?? 3002
  await app.listen(port)

  console.log(`[admin-service] Listening on http://localhost:${port}/api/v1`)
}

void bootstrap()
