import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import { z } from 'zod'

const createDeliverymanBodySchema = z.object({
  name: z.string().min(1),
  cpf: z.string().min(1).max(14),
  password: z.string().min(6),
})

export type CreateDeliverymanBodySchema = z.infer<
  typeof createDeliverymanBodySchema
>

export const createDeliverymanBodyValidationPipe = new ZodValidationPipe(
  createDeliverymanBodySchema,
)
