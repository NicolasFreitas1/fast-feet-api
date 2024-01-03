import { UseCaseError } from '@/core/errors/use-cases-error'

export class DeliverymanAlreadyExistsError
  extends Error
  implements UseCaseError
{
  constructor(identifier: string) {
    super(`Deliveryman "${identifier}" already exists`)
  }
}
