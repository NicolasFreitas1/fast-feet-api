import { Controller, ForbiddenException, Get, Query } from '@nestjs/common'
import { ListOrdersNearbyUseCase } from '@/domain/delivery/application/use-cases/list-orders-nearby'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import { OrderWithPaginationPresenter } from '@/infra/http/presenters/order-with-pagination-presenter'
import {
  NearbyQuerySchema,
  nearbyQueryValidationPipe,
} from './dtos/nearby-query.dto'

@Controller('orders')
export class ListOrdersNearbyController {
  constructor(private listOrdersNearby: ListOrdersNearbyUseCase) {}

  @Get('nearby')
  async handle(
    @Query(nearbyQueryValidationPipe) query: NearbyQuerySchema,
    @CurrentUser() user: UserPayload,
  ) {
    if (user.userRole !== 'DELIVERYMAN') {
      throw new ForbiddenException('Only deliverymen can list nearby orders')
    }
    const result = await this.listOrdersNearby.execute({
      latitude: query.latitude,
      longitude: query.longitude,
      deliverymanId: user.sub,
      page: query.page,
      perPage: query.perPage,
    })

    return OrderWithPaginationPresenter.toHTTP(result.orders)
  }
}
