import { Either, left, right } from '@/core/either'
import { ResourceNotFoundError } from '../../../../core/errors/errors/resource-not-found-error'

import { DeliverymenRepository } from '../repository/deliverymen-repository'

import { Injectable } from '@nestjs/common'
import { Deliveryman } from '../../enterprise/deliveryman'

interface EditDeliverymanUseCaseRequest {
  deliverymanId: string
  name: string
}

type EditDeliverymanUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    deliveryman: Deliveryman
  }
>

@Injectable()
export class EditDeliverymanUseCase {
  constructor(private deliverymenRepository: DeliverymenRepository) {}

  async execute({
    deliverymanId,
    name,
  }: EditDeliverymanUseCaseRequest): Promise<EditDeliverymanUseCaseResponse> {
    const deliveryman = await this.deliverymenRepository.findById(deliverymanId)

    if (!deliveryman) {
      return left(new ResourceNotFoundError())
    }

    deliveryman.name = name

    await this.deliverymenRepository.save(deliveryman)

    return right({
      deliveryman,
    })
  }
}
