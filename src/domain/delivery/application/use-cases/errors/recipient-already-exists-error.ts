import { UseCaseError } from '@/core/errors/use-cases-error'

export class RecipientAlreadyExistsError extends Error implements UseCaseError {
  constructor(identifier: string) {
    super(`Recipient "${identifier}" already exists`)
  }
}
