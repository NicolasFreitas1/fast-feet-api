import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { EnvModule } from './env/env.module'
import { ConfigModule } from '@nestjs/config'
import { envSchema } from './env/env'
import { EnvService } from './env/env.service'
import { RateLimitMiddleware } from './http/middlewares/rate-limit-middleware'
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
    AuthModule,
    HttpModule,
  ],
  controllers: [],
  providers: [
    EnvService,
    RequestLoggerMiddleware,
    SecurityHeadersMiddleware,
    RateLimitMiddleware,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        RequestLoggerMiddleware,
        SecurityHeadersMiddleware,
        RateLimitMiddleware,
      )
      .forRoutes('*')
  }
}
