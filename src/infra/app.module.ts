import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { ThrottlerModule } from '@nestjs/throttler'
import { EnvModule } from './env/env.module'
import { ConfigModule } from '@nestjs/config'
import { envSchema } from './env/env'
import { EnvService } from './env/env.service'
import { RateLimitGuard } from './http/guards/rate-limit.guard'
import { RequestLoggerMiddleware } from './http/middlewares/request-logger-middleware'
import { SecurityHeadersMiddleware } from './http/middlewares/security-headers-middleware'
import { AuthModule } from './auth/auth.module'
import { HttpModule } from './http/http.module'

@Module({
  imports: [
    EnvModule,
    ConfigModule.forRoot({
      envFilePath: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
      validate: (env) => envSchema.parse(env),
      isGlobal: true,
    }),
    ThrottlerModule.forRootAsync({
      imports: [EnvModule],
      inject: [EnvService],
      useFactory: (env: EnvService) => ({
        errorMessage: 'Too many requests, please try again later',
        throttlers: [
          {
            ttl: env.get('RATE_LIMIT_WINDOW_MS'),
            limit: env.get('RATE_LIMIT_MAX_REQUESTS'),
          },
        ],
      }),
    }),
    AuthModule,
    HttpModule,
  ],
  controllers: [],
  providers: [
    EnvService,
    RequestLoggerMiddleware,
    SecurityHeadersMiddleware,
    RateLimitGuard,
    {
      provide: APP_GUARD,
      useClass: RateLimitGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestLoggerMiddleware, SecurityHeadersMiddleware)
      .forRoutes('*')
  }
}
