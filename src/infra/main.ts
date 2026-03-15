import { join } from 'node:path'
import { NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
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

  const swaggerConfig = new DocumentBuilder()
    .setTitle('FastFeet API')
    .setDescription(
      'REST API for authentication, recipients, deliverymen and order lifecycle operations.',
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Paste a valid access token.',
      },
      'access-token',
    )
    .build()

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig)

  SwaggerModule.setup('docs', app, swaggerDocument, {
    jsonDocumentUrl: 'docs/openapi.json',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
    },
  })

  await app.listen(port)
}
bootstrap()
