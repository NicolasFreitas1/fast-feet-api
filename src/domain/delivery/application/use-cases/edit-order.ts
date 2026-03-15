import { Either, left, right } from '@/core/either'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { Injectable } from '@nestjs/common'
import { OrdersRepository } from '../repository/orders-repository'
import { RecipientsRepository } from '../repository/recipients-repository'
import { Order } from '../../enterprise/order'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'

interface EditOrderUseCaseRequest {
  orderId: string
  name?: string
  recipientId?: string
}

type EditOrderUseCaseResponse = Either<ResourceNotFoundError, { order: Order }>

@Injectable()
export class EditOrderUseCase {
  constructor(
    private ordersRepository: OrdersRepository,
    private recipientsRepository: RecipientsRepository,
  ) {}

  async execute({
    orderId,
    name,
    recipientId,
  }: EditOrderUseCaseRequest): Promise<EditOrderUseCaseResponse> {
    const order = await this.ordersRepository.findById(orderId)
    if (!order) {
      return left(new ResourceNotFoundError())
    }

    if (name !== undefined) {
      order.name = name
    }
    if (recipientId !== undefined) {
      const recipient = await this.recipientsRepository.findById(recipientId)
      if (!recipient) {
        return left(new ResourceNotFoundError())
      }
      order.recipientId = new UniqueEntityId(recipientId)
    }

    await this.ordersRepository.save(order)
    return right({ order })
  }
}
