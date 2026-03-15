import { Either, left, right } from '@/core/either'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { NotAllowedError } from '@/core/errors/errors/not-allowed-error'
import { Injectable } from '@nestjs/common'
import { OrdersRepository } from '../repository/orders-repository'
import { Order } from '../../enterprise/order'

interface ReturnOrderUseCaseRequest {
  orderId: string
  deliverymanId: string
}

type ReturnOrderUseCaseResponse = Either<
  ResourceNotFoundError | NotAllowedError,
  { order: Order }
>

@Injectable()
export class ReturnOrderUseCase {
  constructor(private ordersRepository: OrdersRepository) {}

  async execute({
    orderId,
    deliverymanId,
  }: ReturnOrderUseCaseRequest): Promise<ReturnOrderUseCaseResponse> {
    const order = await this.ordersRepository.findById(orderId)
    if (!order) {
      return left(new ResourceNotFoundError())
    }
    if (order.status !== 'pickedUp') {
      return left(new NotAllowedError())
    }
    if (order.deliverymanId?.toString() !== deliverymanId) {
      return left(new NotAllowedError())
    }
    order.returnOrder()
    await this.ordersRepository.save(order)
    return right({ order })
  }
}
