import { Injectable } from '@nestjs/common'
import { OrdersRepository } from '../repository/orders-repository'
import { Order } from '../../enterprise/order'
import { PaginationParams } from '@/core/repositories/pagination-params'

interface ListMyDeliveriesUseCaseRequest extends PaginationParams {
  deliverymanId: string
}

interface ListMyDeliveriesUseCaseResponse {
  orders: Order[]
}

@Injectable()
export class ListMyDeliveriesUseCase {
  constructor(private ordersRepository: OrdersRepository) {}

  async execute({
    deliverymanId,
    page,
    perPage,
  }: ListMyDeliveriesUseCaseRequest): Promise<ListMyDeliveriesUseCaseResponse> {
    const orders = await this.ordersRepository.findMany(
      { page, perPage },
      deliverymanId,
    )
    return { orders }
  }
}
