import { Order } from '@/domain/delivery/enterprise/order'
import { OrderPresenter } from './order-presenter'

export interface OrdersPaginatedResponse {
  orders: ReturnType<typeof OrderPresenter.toHTTP>[]
}

export class OrderWithPaginationPresenter {
  static toHTTP(orders: Order[]): OrdersPaginatedResponse {
    return {
      orders: orders.map(OrderPresenter.toHTTP),
    }
  }
}
