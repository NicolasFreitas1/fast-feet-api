import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Order } from '@/domain/delivery/enterprise/order'
import { Order as PrismaOrder, Prisma } from 'generated/prisma/client'

const statusMap = {
  WAITING: 'waiting',
  PICKEDUP: 'pickedUp',
  DELIVERED: 'delivered',
  RETURNED: 'returned',
} as const

const statusToPrisma = {
  waiting: 'WAITING',
  pickedUp: 'PICKEDUP',
  delivered: 'DELIVERED',
  returned: 'RETURNED',
} as const

export type OrderCachePayload = {
  id: string
  name: string
  status: 'waiting' | 'pickedUp' | 'delivered' | 'returned'
  recipientId: string
  deliverymanId: string | null
  deliveryPhotoUrl: string | null
  createdAt: string
  updatedAt: string | null
  pickedUpAt: string | null
  deliveredAt: string | null
}

export class PrismaOrderMapper {
  static toDomain(raw: PrismaOrder): Order {
    return Order.create(
      {
        name: raw.name,
        status: statusMap[raw.status],
        deliverymanId: raw.deliverymanId
          ? new UniqueEntityId(raw.deliverymanId)
          : undefined,
        recipientId: new UniqueEntityId(raw.recipientId),
        deliveryPhotoUrl: raw.deliveryPhotoUrl ?? undefined,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt ?? undefined,
        pickedUpAt: raw.pickedUpAt ?? undefined,
        deliveredAt: raw.deliveredAt ?? undefined,
      },
      new UniqueEntityId(raw.id),
    )
  }

  static toPrisma(order: Order): Prisma.OrderUncheckedUpdateInput {
    return {
      name: order.name,
      status: statusToPrisma[order.status],
      deliverymanId: order.deliverymanId?.toString() ?? null,
      recipientId: order.recipientId.toString(),
      deliveryPhotoUrl: order.deliveryPhotoUrl ?? null,
      updatedAt: order.updatedAt ?? new Date(),
      pickedUpAt: order.pickedUpAt ?? null,
      deliveredAt: order.deliveredAt ?? null,
    }
  }

  static toPrismaCreate(order: Order): Prisma.OrderUncheckedCreateInput {
    return {
      id: order.id.toString(),
      name: order.name,
      status: statusToPrisma[order.status],
      deliverymanId: order.deliverymanId?.toString() ?? null,
      recipientId: order.recipientId.toString(),
      deliveryPhotoUrl: order.deliveryPhotoUrl ?? null,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt ?? undefined,
      pickedUpAt: order.pickedUpAt ?? null,
      deliveredAt: order.deliveredAt ?? null,
    }
  }

  static toCachePayload(order: Order): OrderCachePayload {
    return {
      id: order.id.toString(),
      name: order.name,
      status: order.status,
      recipientId: order.recipientId.toString(),
      deliverymanId: order.deliverymanId?.toString() ?? null,
      deliveryPhotoUrl: order.deliveryPhotoUrl ?? null,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt?.toISOString() ?? null,
      pickedUpAt: order.pickedUpAt?.toISOString() ?? null,
      deliveredAt: order.deliveredAt?.toISOString() ?? null,
    }
  }

  static fromCachePayload(payload: OrderCachePayload): Order {
    return Order.create(
      {
        name: payload.name,
        status: payload.status,
        recipientId: new UniqueEntityId(payload.recipientId),
        deliverymanId: payload.deliverymanId
          ? new UniqueEntityId(payload.deliverymanId)
          : undefined,
        deliveryPhotoUrl: payload.deliveryPhotoUrl ?? undefined,
        createdAt: new Date(payload.createdAt),
        updatedAt: payload.updatedAt ? new Date(payload.updatedAt) : undefined,
        pickedUpAt: payload.pickedUpAt
          ? new Date(payload.pickedUpAt)
          : undefined,
        deliveredAt: payload.deliveredAt
          ? new Date(payload.deliveredAt)
          : undefined,
      },
      new UniqueEntityId(payload.id),
    )
  }
}
