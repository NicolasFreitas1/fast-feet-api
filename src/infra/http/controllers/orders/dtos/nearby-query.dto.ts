import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import { z } from 'zod'

const nearbyQuerySchema = z.object({
  latitude: z.coerce.number(),
  longitude: z.coerce.number(),
  page: z.coerce.number().min(1).optional().default(1),
  perPage: z.coerce.number().min(1).max(100).optional().default(20),
})

export type NearbyQuerySchema = z.infer<typeof nearbyQuerySchema>

export const nearbyQueryValidationPipe = new ZodValidationPipe(
  nearbyQuerySchema,
)
