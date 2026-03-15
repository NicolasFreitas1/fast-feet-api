import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import { z } from 'zod'

const createOrderBodySchema = z.object({
  name: z.string().min(1),
  recipientId: z.string().uuid(),
})

export type CreateOrderBodySchema = z.infer<typeof createOrderBodySchema>

export const createOrderBodyValidationPipe = new ZodValidationPipe(
  createOrderBodySchema,
)
