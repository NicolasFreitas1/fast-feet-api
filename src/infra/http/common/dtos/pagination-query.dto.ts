import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import { z } from 'zod'

const paginationQuerySchema = z.object({
  page: z.coerce.number().min(1).optional().default(1),
  perPage: z.coerce.number().min(1).max(100).optional().default(20),
})

export type PaginationQuerySchema = z.infer<typeof paginationQuerySchema>

export const paginationQueryValidationPipe = new ZodValidationPipe(
  paginationQuerySchema,
)
