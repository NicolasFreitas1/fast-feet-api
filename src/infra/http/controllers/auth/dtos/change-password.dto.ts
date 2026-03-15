import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import { z } from 'zod'

const changePasswordBodySchema = z.object({
  newPassword: z.string().min(6),
})

export type ChangePasswordBodySchema = z.infer<typeof changePasswordBodySchema>

export const changePasswordBodyValidationPipe = new ZodValidationPipe(
  changePasswordBodySchema,
)
