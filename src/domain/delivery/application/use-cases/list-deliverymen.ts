import { Either, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { Deliveryman } from '../../enterprise/deliveryman'
import { DeliverymenRepository } from '../repository/deliverymen-repository'

interface ListDeliverymenUseCaseRequest {
  page: number
  perPage: number
}

type ListDeliverymenUseCaseResponse = Either<
  null,
  {
    deliverymen: Deliveryman[]
  }
>

@Injectable()
export class ListDeliverymenUseCase {
  constructor(private deliverymenRepository: DeliverymenRepository) {}

  async execute({
    page,
    perPage,
  }: ListDeliverymenUseCaseRequest): Promise<ListDeliverymenUseCaseResponse> {
    const deliverymen = await this.deliverymenRepository.findMany({
      page,
      perPage,
    })

    return right({
      deliverymen,
    })
  }
}
