import { PaginationParams } from 'src/core/repositories/pagination-params'
import { Order } from '../../enterprise/order'
import { Coordinate } from '../../enterprise/value-objects/location'

export abstract class OrdersRepository {
  abstract findMany(
    params: PaginationParams,
    deliverymanId: string,
  ): Promise<Order[]>

  abstract findManyByNearby(
    params: PaginationParams,
    location: Coordinate,
    deliverymanId: string,
  ): Promise<Order[]>

  abstract findManyByRecipient(
    params: PaginationParams,
    recipientId: string,
    deliverymanId: string,
  ): Promise<Order[]>

  abstract findById(id: string, deliverymanId: string): Promise<Order | null>
  abstract create(order: Order): Promise<void>
  abstract save(order: Order): Promise<void>
  abstract delete(order: Order): Promise<void>
}
