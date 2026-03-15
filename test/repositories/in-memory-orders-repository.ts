import { PaginationParams } from '@/core/repositories/pagination-params'
import { OrdersRepository } from '@/domain/delivery/application/repository/orders-repository'
import { Order } from '@/domain/delivery/enterprise/order'
import { Coordinate } from '@/domain/delivery/enterprise/value-objects/location'
export class InMemoryOrdersRepository implements OrdersRepository {
  public items: Order[] = []

  async findManyForAdmin({
    page,
    perPage,
  }: PaginationParams): Promise<Order[]> {
    const sorted = [...this.items].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    return sorted.slice((page - 1) * perPage, page * perPage)
  }

  async findMany(
    { page, perPage }: PaginationParams,
    deliverymanId: string,
  ): Promise<Order[]> {
    const filtered = this.items.filter(
      (o) => o.deliverymanId?.toString() === deliverymanId,
    )
    const sorted = filtered.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    return sorted.slice((page - 1) * perPage, page * perPage)
  }

  async findManyByNearby(
    { page, perPage }: PaginationParams,
    location: Coordinate,
    deliverymanId: string,
  ): Promise<Order[]> {
    void location
    void deliverymanId
    const waiting = this.items.filter(
      (o) => o.status === 'waiting' && !o.deliverymanId,
    )
    if (waiting.length === 0) return []
    const withDistance = waiting.map((order) => ({
      order,
      distance: 0,
    }))
    const start = (page - 1) * perPage
    return withDistance.slice(start, start + perPage).map(({ order }) => order)
  }

  async findManyByRecipient(
    { page, perPage }: PaginationParams,
    recipientId: string,
    deliverymanId: string,
  ): Promise<Order[]> {
    const filtered = this.items.filter(
      (o) =>
        o.recipientId.toString() === recipientId &&
        o.deliverymanId?.toString() === deliverymanId,
    )
    return filtered.slice((page - 1) * perPage, page * perPage)
  }

  async findById(
    id: string,
    deliverymanId?: string | null,
  ): Promise<Order | null> {
    const order = this.items.find((o) => o.id.toString() === id)
    if (!order) return null
    if (
      deliverymanId != null &&
      order.deliverymanId?.toString() !== deliverymanId
    ) {
      return null
    }
    return order
  }

  async create(order: Order): Promise<void> {
    this.items.push(order)
  }

  async save(order: Order): Promise<void> {
    const index = this.items.findIndex((o) => o.id.equals(order.id))
    if (index >= 0) this.items[index] = order
  }

  async delete(order: Order): Promise<void> {
    const index = this.items.findIndex((o) => o.id.equals(order.id))
    if (index >= 0) this.items.splice(index, 1)
  }
}
