import { rm } from 'node:fs/promises'
import { config } from 'dotenv'
import { Redis } from 'ioredis'

import { DomainEvents } from '@/core/events/domain-events'
import { envSchema } from '@/infra/env/env'
import { RequestLoggerMiddleware } from '@/infra/http/middlewares/request-logger-middleware'
import { PrismaClient } from 'generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

process.env.NODE_ENV = 'test'
config({ path: '.env', override: true })
config({ path: '.env.test', override: true })

const env = envSchema.parse(process.env)

/** Env validado no load do setup; usar em E2E para DATABASE_URL e JWT (mesma fonte). */
export function getE2eEnv(): typeof env {
  return env
}

/** Sempre lê do env validado (carregado no load do setup) para evitar que testes anteriores alterem process.env. */
export function getDatabaseURL(): string {
  const url = env.DATABASE_URL
  if (!url) {
    throw new Error('Please provide a DATABASE_URL environment variable')
  }
  return url
}

// Garante que a app Nest use o mesmo banco dos testes (antes de qualquer import do app)
process.env.DATABASE_URL = getDatabaseURL()
process.env.STORAGE_DRIVER = process.env.STORAGE_DRIVER ?? 'local'
process.env.STORAGE_LOCAL_BASE_URL =
  process.env.STORAGE_LOCAL_BASE_URL ?? 'http://localhost:3000/uploads'

/** Limpa as tabelas e o cache Redis antes de cada arquivo de teste para isolar dados entre specs. */
export async function truncateDatabase(): Promise<void> {
  process.env.DATABASE_URL = getDatabaseURL()
  const client = new PrismaClient({
    adapter: new PrismaPg({ connectionString: getDatabaseURL() }),
  })
  try {
    await client.$executeRawUnsafe(`
      TRUNCATE TABLE "order", "user", "recipient" RESTART IDENTITY CASCADE
    `)
  } finally {
    await client.$disconnect()
  }
  await flushE2eCache()
  await rm('data/uploads/test', { recursive: true, force: true })
}

/**
 * Limpa o cache Redis usado nos E2E para evitar que findById (order) retorne dado
 * de outro teste. Use REDIS_DB distinto em .env.test (ex.: 1) para não afetar dev.
 * Se Redis estiver indisponível, ignora para não quebrar a suíte (ex.: CI sem Redis).
 */
export async function flushE2eCache(): Promise<void> {
  try {
    const { REDIS_HOST, REDIS_PORT, REDIS_DB } = getE2eEnv()
    const redis = new Redis({
      host: REDIS_HOST,
      port: REDIS_PORT,
      db: REDIS_DB,
    })
    try {
      await redis.flushdb()
    } finally {
      await redis.quit()
    }
  } catch {
    // Redis indisponível (ex.: CI); segue sem limpar cache
  }
}

let prisma: PrismaClient

beforeAll(async () => {
  process.env.DATABASE_URL = getDatabaseURL()
  DomainEvents.shouldRun = false
  RequestLoggerMiddleware.shouldRun = false

  prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: getDatabaseURL() }),
  })

  await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE "order", "user", "recipient" RESTART IDENTITY CASCADE
  `)

  await flushE2eCache()
}, 30000)

afterAll(async () => {
  try {
    await prisma.$executeRawUnsafe(`
      TRUNCATE TABLE "order", "user", "recipient" RESTART IDENTITY CASCADE
    `)
  } finally {
    await prisma.$disconnect()
  }
})
