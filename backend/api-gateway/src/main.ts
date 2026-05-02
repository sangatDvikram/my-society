import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { AppModule } from './app.module'

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule)

  /**
   * Global ValidationPipe — applies class-validator rules on every request body.
   *
   *  whitelist: true          — strips unknown properties automatically
   *  forbidNonWhitelisted: true — throws 400 if unknown properties are sent
   *  transform: true           — auto-coerces primitives (string → number, etc.)
   */
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )

  // Global prefix for all API routes
  app.setGlobalPrefix('api/v1')

  // Enable graceful shutdown hooks
  app.enableShutdownHooks()

  const port = process.env['PORT'] ?? 3000
  await app.listen(port)

  console.log(`[api-gateway] Listening on http://localhost:${port}/api/v1`)
}

void bootstrap()
