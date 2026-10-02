import { ExecutionContext, Injectable } from '@nestjs/common'
import { ThrottlerGuard } from '@nestjs/throttler'

@Injectable()
export class OtpThrottlerGuard extends ThrottlerGuard {
  protected override getTracker(req: Record<string, unknown>): Promise<string> {
    return Promise.resolve((req['ip'] as string | undefined) ?? 'unknown')
  }

  protected override getRequestResponse(context: ExecutionContext): { req: Record<string, unknown>; res: Record<string, unknown> } {
    const http = context.switchToHttp()
    return {
      req: http.getRequest<Record<string, unknown>>(),
      res: http.getResponse<Record<string, unknown>>(),
    }
  }
}
