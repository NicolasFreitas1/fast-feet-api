import { faker } from '@faker-js/faker'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Order } from '@/domain/delivery/enterprise/order'
import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { PrismaOrderMapper } from '@/infra/database/prisma/mappers/prisma-order-mapper'

export function makeOrder(
  override: Partial<{
    name: string
    status: 'waiting' | 'pickedUp' | 'delivered' | 'returned'
    recipientId: UniqueEntityId
    deliverymanId: UniqueEntityId | null
    createdAt: Date
  }> = {},
  id?: UniqueEntityId,
) {
  return Order.create(
    {
      name: override.name ?? faker.commerce.productName(),
      status: override.status ?? 'waiting',
      recipientId: override.recipientId ?? new UniqueEntityId(),
      deliverymanId: override.deliverymanId ?? undefined,
      createdAt: override.createdAt ?? new Date(),
    },
    id,
  )
}

@Injectable()
export class OrderFactory {
  constructor(private prisma: PrismaService) {}

  async makePrismaOrder(data: {
    recipientId: string
    name?: string
    deliverymanId?: string | null
    status?: 'waiting' | 'pickedUp' | 'delivered' | 'returned'
  }): Promise<Order> {
    const status = data.status ?? 'waiting'
    const order = Order.create({
      name: data.name ?? faker.commerce.productName(),
      status,
      recipientId: new UniqueEntityId(data.recipientId),
      deliverymanId: data.deliverymanId
        ? new UniqueEntityId(data.deliverymanId)
        : undefined,
      createdAt: new Date(),
    })
    await this.prisma.order.create({
      data: PrismaOrderMapper.toPrismaCreate(order),
    })
    return order
  }
}
