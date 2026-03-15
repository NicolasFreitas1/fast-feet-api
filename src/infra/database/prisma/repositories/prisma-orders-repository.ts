import { OrdersRepository } from '@/domain/delivery/application/repository/orders-repository'
import { Order } from '@/domain/delivery/enterprise/order'
import { Coordinate } from '@/domain/delivery/enterprise/value-objects/location'
import { getDistanceBetweenCoordinates } from '@/domain/delivery/enterprise/value-objects/location'
import { PaginationParams } from '@/core/repositories/pagination-params'
import { Injectable } from '@nestjs/common'
import { PrismaOrderMapper } from '../mappers/prisma-order-mapper'
import { PrismaService } from '../prisma.service'
import { CacheRepository } from '@/infra/cache/cache-repository'
import { DomainEvents } from '@/core/events/domain-events'

const DEFAULT_NEARBY_RADIUS_METERS = 10_000 // 10 km
const CACHE_KEY_PREFIX = 'order'

@Injectable()
export class PrismaOrdersRepository implements OrdersRepository {
  constructor(
    private prisma: PrismaService,
    private cache: CacheRepository,
  ) {}

  async findManyForAdmin({
    page,
    perPage,
  }: PaginationParams): Promise<Order[]> {
    const orders = await this.prisma.order.findMany({
      take: perPage,
      skip: (page - 1) * perPage,
      orderBy: { createdAt: 'desc' },
    })
    return orders.map(PrismaOrderMapper.toDomain)
  }

  async findMany(
    { page, perPage }: PaginationParams,
    deliverymanId: string,
  ): Promise<Order[]> {
    const orders = await this.prisma.order.findMany({
      where: { deliverymanId },
      take: perPage,
      skip: (page - 1) * perPage,
      orderBy: { createdAt: 'desc' },
    })
    return orders.map(PrismaOrderMapper.toDomain)
  }

  async findManyByNearby(
    { page, perPage }: PaginationParams,
    location: Coordinate,
    deliverymanId: string,
  ): Promise<Order[]> {
    void deliverymanId
    const ordersWithRecipient = await this.prisma.order.findMany({
      where: { status: 'WAITING', deliverymanId: null },
      include: { recipient: true },
      orderBy: { createdAt: 'desc' },
    })
    const withDistance = ordersWithRecipient
      .map((order) => {
        const distance = getDistanceBetweenCoordinates(location, {
          latitude: Number(order.recipient.latitude),
          longitude: Number(order.recipient.longitude),
        })
        return { order, distance }
      })
      .filter(({ distance }) => distance <= DEFAULT_NEARBY_RADIUS_METERS)
      .sort((a, b) => a.distance - b.distance)
    const start = (page - 1) * perPage
    const pageItems = withDistance.slice(start, start + perPage)
    return pageItems.map(({ order }) => PrismaOrderMapper.toDomain(order))
  }

  async findManyByRecipient(
    { page, perPage }: PaginationParams,
    recipientId: string,
    deliverymanId: string,
  ): Promise<Order[]> {
    const orders = await this.prisma.order.findMany({
      where: { recipientId, deliverymanId },
      take: perPage,
      skip: (page - 1) * perPage,
      orderBy: { createdAt: 'desc' },
    })
    return orders.map(PrismaOrderMapper.toDomain)
  }

  async findById(
    id: string,
    deliverymanId?: string | null,
  ): Promise<Order | null> {
    const cacheKey = `${CACHE_KEY_PREFIX}:${id}:details`
    if (deliverymanId == null) {
      const cacheHit = await this.cache.get(cacheKey)
      if (cacheHit) {
        const payload = JSON.parse(
          cacheHit,
        ) as import('../mappers/prisma-order-mapper').OrderCachePayload
        return PrismaOrderMapper.fromCachePayload(payload)
      }
    }
    const order = await this.prisma.order.findUnique({
      where: { id },
    })
    if (!order) return null
    if (deliverymanId != null && order.deliverymanId !== deliverymanId) {
      return null
    }
    const domainOrder = PrismaOrderMapper.toDomain(order)
    if (deliverymanId == null) {
      await this.cache.set(
        cacheKey,
        JSON.stringify(PrismaOrderMapper.toCachePayload(domainOrder)),
      )
    }
    return domainOrder
  }

  async create(order: Order): Promise<void> {
    await this.prisma.order.create({
      data: PrismaOrderMapper.toPrismaCreate(order),
    })
    DomainEvents.dispatchEventsForAggregate(order.id)
  }

  async save(order: Order): Promise<void> {
    await this.prisma.order.update({
      where: { id: order.id.toString() },
      data: PrismaOrderMapper.toPrisma(order),
    })
    await this.cache.delete(
      `${CACHE_KEY_PREFIX}:${order.id.toString()}:details`,
    )
    DomainEvents.dispatchEventsForAggregate(order.id)
  }

  async delete(order: Order): Promise<void> {
    await this.prisma.order.delete({
      where: { id: order.id.toString() },
    })
    await this.cache.delete(
      `${CACHE_KEY_PREFIX}:${order.id.toString()}:details`,
    )
  }
}
