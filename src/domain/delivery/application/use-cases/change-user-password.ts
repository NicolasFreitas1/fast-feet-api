import { Either, left, right } from '@/core/either'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { Injectable } from '@nestjs/common'
import { AdminsRepository } from '../repository/admins-repository'
import { DeliverymenRepository } from '../repository/deliverymen-repository'
import { HashGenerator } from '../cryptography/hash-generator'

interface ChangeUserPasswordUseCaseRequest {
  userId: string
  newPassword: string
}

type ChangeUserPasswordUseCaseResponse = Either<
  ResourceNotFoundError,
  Record<string, never>
>

@Injectable()
export class ChangeUserPasswordUseCase {
  constructor(
    private adminsRepository: AdminsRepository,
    private deliverymenRepository: DeliverymenRepository,
    private hashGenerator: HashGenerator,
  ) {}

  async execute({
    userId,
    newPassword,
  }: ChangeUserPasswordUseCaseRequest): Promise<ChangeUserPasswordUseCaseResponse> {
    const admin = await this.adminsRepository.findById(userId)
    if (admin) {
      admin.password = await this.hashGenerator.hash(newPassword)
      await this.adminsRepository.save(admin)
      return right({})
    }

    const deliveryman = await this.deliverymenRepository.findById(userId)
    if (deliveryman) {
      deliveryman.password = await this.hashGenerator.hash(newPassword)
      await this.deliverymenRepository.save(deliveryman)
      return right({})
    }

    return left(new ResourceNotFoundError())
  }
}
