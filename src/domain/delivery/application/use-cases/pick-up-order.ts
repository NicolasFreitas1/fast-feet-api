import { Either, left, right } from '@/core/either'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { NotAllowedError } from '@/core/errors/errors/not-allowed-error'
import { Injectable } from '@nestjs/common'
import { OrdersRepository } from '../repository/orders-repository'
import { Order } from '../../enterprise/order'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'

interface PickUpOrderUseCaseRequest {
  orderId: string
  deliverymanId: string
}

type PickUpOrderUseCaseResponse = Either<
  ResourceNotFoundError | NotAllowedError,
  { order: Order }
>

@Injectable()
export class PickUpOrderUseCase {
  constructor(private ordersRepository: OrdersRepository) {}

  async execute({
    orderId,
    deliverymanId,
  }: PickUpOrderUseCaseRequest): Promise<PickUpOrderUseCaseResponse> {
    const order = await this.ordersRepository.findById(orderId)
    if (!order) {
      return left(new ResourceNotFoundError())
    }
    if (order.status !== 'waiting') {
      return left(new NotAllowedError())
    }
    order.pickUp(new UniqueEntityId(deliverymanId))
    await this.ordersRepository.save(order)
    return right({ order })
  }
}
