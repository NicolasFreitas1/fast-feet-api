import { Either, left, right } from '@/core/either'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { Injectable } from '@nestjs/common'
import { OrdersRepository } from '../repository/orders-repository'
import { Order } from '../../enterprise/order'

interface GetOrderByIdUseCaseRequest {
  orderId: string
  deliverymanId?: string | null
}

type GetOrderByIdUseCaseResponse = Either<
  ResourceNotFoundError,
  { order: Order }
>

@Injectable()
export class GetOrderByIdUseCase {
  constructor(private ordersRepository: OrdersRepository) {}

  async execute({
    orderId,
    deliverymanId,
  }: GetOrderByIdUseCaseRequest): Promise<GetOrderByIdUseCaseResponse> {
    const order = await this.ordersRepository.findById(orderId, deliverymanId)
    if (!order) {
      return left(new ResourceNotFoundError())
    }
    return right({ order })
  }
}
