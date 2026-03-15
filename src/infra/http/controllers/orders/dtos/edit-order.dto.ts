import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import { z } from 'zod'

const editOrderBodySchema = z.object({
  name: z.string().min(1).optional(),
  recipientId: z.string().uuid().optional(),
})

export type EditOrderBodySchema = z.infer<typeof editOrderBodySchema>

export const editOrderBodyValidationPipe = new ZodValidationPipe(
  editOrderBodySchema,
)
