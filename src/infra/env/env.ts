import { z } from 'zod'

export const envSchema = z
  .object({
    DATABASE_URL: z.string().url(),
    JWT_PRIVATE_KEY: z.string(),
    JWT_PUBLIC_KEY: z.string(),
    STORAGE_DRIVER: z.enum(['local', 'r2']).optional().default('local'),
    STORAGE_LOCAL_DIR: z.string().optional().default('data/uploads'),
    STORAGE_LOCAL_BASE_URL: z
      .string()
      .url()
      .optional()
      .default('http://localhost:3333/uploads'),
    CLOUDFLARE_ACCOUNT_ID: z.string().optional(),
    AWS_BUCKET_NAME: z.string().optional(),
    AWS_ACCESS_KEY_ID: z.string().optional(),
    AWS_SECRET_ACCESS_KEY: z.string().optional(),
    AWS_ENDPOINT_URL: z.string().url().optional(),
    UPLOAD_PUBLIC_BASE_URL: z.string().url().optional(),
    REDIS_HOST: z.string().optional().default('localhost'),
    REDIS_PORT: z.coerce.number().optional().default(6379),
    REDIS_DB: z.coerce.number().optional().default(0),
    PORT: z.coerce.number().optional().default(3333),
    APP_BASE_URL: z.string().url().optional().default('http://localhost:3333'),
    CORS_ORIGIN: z.string().optional().default('http://localhost:3000'),
    RATE_LIMIT_WINDOW_MS: z.coerce.number().optional().default(60000),
    RATE_LIMIT_MAX_REQUESTS: z.coerce.number().optional().default(100),
  })
  .superRefine((env, ctx) => {
    if (env.STORAGE_DRIVER !== 'r2') {
      return
    }

    const requiredKeys = [
      'AWS_BUCKET_NAME',
      'AWS_ACCESS_KEY_ID',
      'AWS_SECRET_ACCESS_KEY',
      'UPLOAD_PUBLIC_BASE_URL',
    ] as const

    for (const key of requiredKeys) {
      if (!env[key]) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [key],
          message: `${key} is required when STORAGE_DRIVER is set to r2`,
        })
      }
    }
  })

export type Env = z.infer<typeof envSchema>
