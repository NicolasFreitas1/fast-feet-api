import type { Provider } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { PrismaClient } from 'generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { EnvService } from '@/infra/env/env.service'
import type { Env } from '@/infra/env/env'
import { getDatabaseURL, getE2eEnv } from 'test/setup-e2e'

const e2eEnv = getE2eEnv()

/**
 * Cria uma instância de PrismaClient conectada ao mesmo banco do setup E2E,
 * com lifecycle hooks para Nest (onModuleInit / onModuleDestroy).
 * Conecta logo na criação para garantir que o mesmo banco seja usado desde o primeiro uso.
 */
async function createE2ePrismaService(): Promise<PrismaService> {
  const connectionString = getDatabaseURL()
  const adapter = new PrismaPg({ connectionString })
  const client = new PrismaClient({ adapter }) as PrismaService
  await client.$connect()
  client.onModuleInit = () => client.$connect()
  client.onModuleDestroy = () => client.$disconnect()
  return client
}

/**
 * Cria o TestingModule E2E com EnvService e PrismaService sobrescritos para que a app
 * use exatamente o mesmo env e banco do setup (DATABASE_URL + JWT), evitando 401 e
 * "record not found" ao rodar a suíte inteira.
 * Usa um único PrismaClient (useValue) para garantir que factories e app usem o mesmo banco.
 */
export async function createE2eTestingModule(
  providers: Provider[] = [],
  envOverrides: Partial<Env> = {},
) {
  process.env.DATABASE_URL = getDatabaseURL()
  const prismaService = await createE2ePrismaService()
  return Test.createTestingModule({
    imports: [AppModule, DatabaseModule],
    providers,
  })
    .overrideProvider(EnvService)
    .useValue({
      get: (key: keyof Env) => envOverrides[key] ?? e2eEnv[key],
    })
    .overrideProvider(PrismaService)
    .useValue(prismaService)
    .compile()
}
