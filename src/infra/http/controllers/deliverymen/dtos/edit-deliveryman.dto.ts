import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import { z } from 'zod'

const editDeliverymanBodySchema = z.object({
  name: z.string().min(1).optional(),
})

export type EditDeliverymanBodySchema = z.infer<
  typeof editDeliverymanBodySchema
>

export const editDeliverymanBodyValidationPipe = new ZodValidationPipe(
  editDeliverymanBodySchema,
)
