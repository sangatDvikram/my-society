import 'reflect-metadata'

import { Logger, ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'

import { AppModule } from './app.module'

async function bootstrap(): Promise<void> {
  // rawBody: true preserves the raw request buffer for Razorpay webhook HMAC verification
  const app = await NestFactory.create(AppModule, { rawBody: true })

  // rawBody: true in NestFactory.create is sufficient for WebhookSignatureGuard

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )

  app.setGlobalPrefix('api/v1')
  app.enableShutdownHooks()

  const port = process.env['PORT'] ?? 3000
  await app.listen(port)

  new Logger('Bootstrap').log(`[api-gateway] Listening on http://localhost:${port}/api/v1`)
}

void bootstrap()
