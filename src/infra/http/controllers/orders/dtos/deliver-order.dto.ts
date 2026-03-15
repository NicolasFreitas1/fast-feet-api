import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import { z } from 'zod'

const deliverOrderBodySchema = z.object({
  deliveryPhotoUrl: z.string().url().min(1),
})

export type DeliverOrderBodySchema = z.infer<typeof deliverOrderBodySchema>

export const deliverOrderBodyValidationPipe = new ZodValidationPipe(
  deliverOrderBodySchema,
)
