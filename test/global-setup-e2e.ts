import { config } from 'dotenv'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { Client } from 'pg'

config({ path: '.env', override: true })
config({ path: '.env.test', override: true })

async function resetDatabaseSchema() {
  const databaseUrl = process.env.DATABASE_URL

  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required for E2E setup')
  }

  const client = new Client({ connectionString: databaseUrl })
  await client.connect()

  try {
    await client.query('DROP SCHEMA IF EXISTS public CASCADE;')
    await client.query('CREATE SCHEMA public;')

    const migrationDirectories = readdirSync(
      join(process.cwd(), 'prisma/migrations'),
    )
      .filter((directory) => directory !== 'migration_lock.toml')
      .sort()

    for (const directory of migrationDirectories) {
      const migrationFile = join(
        process.cwd(),
        'prisma/migrations',
        directory,
        'migration.sql',
      )
      const sql = readFileSync(migrationFile, 'utf-8')
      await client.query(sql)
    }
  } finally {
    await client.end()
  }
}

export default async function globalSetup() {
  await resetDatabaseSchema()
}
