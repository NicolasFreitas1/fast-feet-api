import { UseCaseError } from '@/core/errors/use-cases-error'

export class ResourceNotFoundError extends Error implements UseCaseError {
  constructor() {
    super('Resource not found')
  }
}
