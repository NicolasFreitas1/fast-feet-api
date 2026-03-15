import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import { z } from 'zod'

const loginBodySchema = z.object({
  cpf: z.string().min(1),
  password: z.string().min(1),
})

export type LoginBodySchema = z.infer<typeof loginBodySchema>

export const loginBodyValidationPipe = new ZodValidationPipe(loginBodySchema)
