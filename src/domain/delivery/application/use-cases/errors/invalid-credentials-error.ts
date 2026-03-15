import { UseCaseError } from '@/core/errors/use-cases-error'

export class InvalidCredentialsError extends Error implements UseCaseError {
  constructor() {
    super('Invalid credentials')
  }
}
