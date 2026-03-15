import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import { z } from 'zod'

const editRecipientBodySchema = z.object({
  name: z.string().min(1).optional(),
  address: z.string().min(1).optional(),
  phone: z.string().min(1).max(10).optional(),
  cpf: z.string().min(1).max(14).optional(),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
})

export type EditRecipientBodySchema = z.infer<typeof editRecipientBodySchema>

export const editRecipientBodyValidationPipe = new ZodValidationPipe(
  editRecipientBodySchema,
)
