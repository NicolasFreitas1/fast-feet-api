import {
  Injectable,
  NestMiddleware,
  TooManyRequestsException,
} from '@nestjs/common'
import { NextFunction, Request, Response } from 'express'
import { EnvService } from '@/infra/env/env.service'

type RateLimitEntry = {
  count: number
  resetAt: number
}

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private readonly requests = new Map<string, RateLimitEntry>()

  constructor(private env: EnvService) {}

  use(request: Request, response: Response, next: NextFunction) {
    const now = Date.now()
    const windowMs = this.env.get('RATE_LIMIT_WINDOW_MS')
    const maxRequests = this.env.get('RATE_LIMIT_MAX_REQUESTS')
    const key = request.ip || request.socket.remoteAddress || 'unknown'
    const current = this.requests.get(key)

    if (!current || current.resetAt <= now) {
      this.requests.set(key, {
        count: 1,
        resetAt: now + windowMs,
      })
      response.setHeader('X-RateLimit-Limit', maxRequests.toString())
      response.setHeader('X-RateLimit-Remaining', (maxRequests - 1).toString())
      next()
      return
    }

    if (current.count >= maxRequests) {
      throw new TooManyRequestsException(
        'Too many requests, please try again later',
      )
    }

    current.count += 1
    this.requests.set(key, current)
    response.setHeader('X-RateLimit-Limit', maxRequests.toString())
    response.setHeader(
      'X-RateLimit-Remaining',
      Math.max(maxRequests - current.count, 0).toString(),
    )
    next()
  }
}
