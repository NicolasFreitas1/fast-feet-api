import { Either, left, right } from '@/core/either'
import { ResourceNotFoundError } from '../../../../core/errors/errors/resource-not-found-error'

import { DeliverymenRepository } from '../repository/deliverymen-repository'

import { Injectable } from '@nestjs/common'
import { Deliveryman } from '../../enterprise/deliveryman'

interface GetDeliverymanByIdUseCaseRequest {
  deliverymanId: string
}

type GetDeliverymanByIdUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    deliveryman: Deliveryman
  }
>

@Injectable()
export class GetDeliverymanByIdUseCase {
  constructor(private deliverymenRepository: DeliverymenRepository) {}

  async execute({
    deliverymanId,
  }: GetDeliverymanByIdUseCaseRequest): Promise<GetDeliverymanByIdUseCaseResponse> {
    const deliveryman = await this.deliverymenRepository.findById(deliverymanId)

    if (!deliveryman) {
      return left(new ResourceNotFoundError())
    }

    return right({
      deliveryman,
    })
  }
}
