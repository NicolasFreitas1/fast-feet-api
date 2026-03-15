import { join } from 'node:path'
import { NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
import { AppModule } from './app.module'
import { EnvService } from './env/env.service'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)

  const envService = app.get(EnvService)
  const port = envService.get('PORT')
  const corsOrigin = envService.get('CORS_ORIGIN')

  app.enableCors({
    origin:
      corsOrigin === '*'
        ? true
        : corsOrigin.split(',').map((origin) => origin.trim()),
    credentials: true,
  })

  app.useStaticAssets(join(process.cwd(), 'data/uploads'), {
    prefix: '/uploads',
  })
  app.useStaticAssets(join(process.cwd(), 'docs/api'), {
    prefix: '/docs',
  })

  await app.listen(port)
}
bootstrap()
