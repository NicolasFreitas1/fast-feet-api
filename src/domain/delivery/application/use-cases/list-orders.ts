import { Either, right } from '@/core/either'
import { PaginationParams } from '@/core/repositories/pagination-params'
import { Injectable } from '@nestjs/common'
import { Order } from '../../enterprise/order'
import { OrdersRepository } from '../repository/orders-repository'

type ListOrdersUseCaseRequest = PaginationParams

type ListOrdersUseCaseResponse = Either<null, { orders: Order[] }>

@Injectable()
export class ListOrdersUseCase {
  constructor(private ordersRepository: OrdersRepository) {}

  async execute(
    params: ListOrdersUseCaseRequest,
  ): Promise<ListOrdersUseCaseResponse> {
    const orders = await this.ordersRepository.findManyForAdmin(params)
    return right({ orders })
  }
}
