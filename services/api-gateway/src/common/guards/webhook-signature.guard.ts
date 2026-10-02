import { createHmac, timingSafeEqual } from 'crypto'

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Request } from 'express'

interface RawBodyRequest extends Request {
  rawBody?: Buffer
}

@Injectable()
export class WebhookSignatureGuard implements CanActivate {
  private readonly logger = new Logger(WebhookSignatureGuard.name)

  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RawBodyRequest>()
    const signature = request.headers['x-razorpay-signature']

    if (!signature || typeof signature !== 'string') {
      throw new UnauthorizedException('Missing X-Razorpay-Signature header')
    }

    if (!request.rawBody) {
      this.logger.error('rawBody is undefined — ensure rawBody:true is set in NestFactory.create')
      throw new UnauthorizedException('Cannot verify webhook signature: raw body unavailable')
    }

    const secret = this.configService.getOrThrow<string>('RAZORPAY_WEBHOOK_SECRET')
    const expected = createHmac('sha256', secret).update(request.rawBody).digest('hex')

    const expectedBuf = Buffer.from(expected, 'hex')
    const receivedBuf = Buffer.from(signature, 'hex')

    if (
      expectedBuf.length !== receivedBuf.length ||
      !timingSafeEqual(expectedBuf, receivedBuf)
    ) {
      this.logger.warn('Webhook signature mismatch — possible spoofed request')
      throw new UnauthorizedException('Invalid webhook signature')
    }

    return true
  }
}
