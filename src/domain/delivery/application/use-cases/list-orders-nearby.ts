import { Injectable } from '@nestjs/common'
import { OrdersRepository } from '../repository/orders-repository'
import { Order } from '../../enterprise/order'
import { PaginationParams } from '@/core/repositories/pagination-params'

interface ListOrdersNearbyUseCaseRequest extends PaginationParams {
  latitude: number
  longitude: number
  deliverymanId: string
}

interface ListOrdersNearbyUseCaseResponse {
  orders: Order[]
}

@Injectable()
export class ListOrdersNearbyUseCase {
  constructor(private ordersRepository: OrdersRepository) {}

  async execute({
    latitude,
    longitude,
    deliverymanId,
    page,
    perPage,
  }: ListOrdersNearbyUseCaseRequest): Promise<ListOrdersNearbyUseCaseResponse> {
    const orders = await this.ordersRepository.findManyByNearby(
      { page, perPage },
      { latitude, longitude },
      deliverymanId,
    )
    return { orders }
  }
}
