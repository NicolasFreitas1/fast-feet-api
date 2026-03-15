import { Either, left, right } from '@/core/either'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { Injectable } from '@nestjs/common'
import { OrdersRepository } from '../repository/orders-repository'
import { RecipientsRepository } from '../repository/recipients-repository'
import { Order } from '../../enterprise/order'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'

interface CreateOrderUseCaseRequest {
  name: string
  recipientId: string
}

type CreateOrderUseCaseResponse = Either<
  ResourceNotFoundError,
  { order: Order }
>

@Injectable()
export class CreateOrderUseCase {
  constructor(
    private ordersRepository: OrdersRepository,
    private recipientsRepository: RecipientsRepository,
  ) {}

  async execute({
    name,
    recipientId,
  }: CreateOrderUseCaseRequest): Promise<CreateOrderUseCaseResponse> {
    const recipient = await this.recipientsRepository.findById(recipientId)
    if (!recipient) {
      return left(new ResourceNotFoundError())
    }

    const order = Order.create({
      name,
      recipientId: new UniqueEntityId(recipientId),
      status: 'waiting',
    })
    await this.ordersRepository.create(order)
    return right({ order })
  }
}
