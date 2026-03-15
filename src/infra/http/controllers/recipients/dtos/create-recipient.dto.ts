import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import { z } from 'zod'

const createRecipientBodySchema = z.object({
  name: z.string().min(1),
  address: z.string().min(1),
  phone: z.string().min(1).max(10),
  cpf: z.string().min(1).max(14),
  latitude: z.coerce.number(),
  longitude: z.coerce.number(),
})

export type CreateRecipientBodySchema = z.infer<
  typeof createRecipientBodySchema
>

export const createRecipientBodyValidationPipe = new ZodValidationPipe(
  createRecipientBodySchema,
)
