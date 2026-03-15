import { Injectable, Logger, NestMiddleware } from '@nestjs/common'
import { Request, Response } from 'express'

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP')

  public static shouldRun = true

  public async use(request: Request, response: Response, next: () => void) {
    if (!RequestLoggerMiddleware.shouldRun) {
      return next()
    }

    response.on('finish', async () => {
      const { method, originalUrl } = request
      const { statusCode, statusMessage } = response

      const message = `${method} ${originalUrl} ${statusCode} ${statusMessage} `

      if (statusCode >= 500) {
        return this.logger.error(message)
      }

      if (statusCode >= 400) {
        return this.logger.warn(message)
      }

      return this.logger.log(message)
    })

    next()
  }
}
