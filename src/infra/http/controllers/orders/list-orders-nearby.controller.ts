import { Controller, ForbiddenException, Get, Query } from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { ListOrdersNearbyUseCase } from '@/domain/delivery/application/use-cases/list-orders-nearby'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import { OrderWithPaginationPresenter } from '@/infra/http/presenters/order-with-pagination-presenter'
import {
  ApiForbiddenErrorResponse,
  ApiJwtAuth,
  ApiNearbyOrdersQuery,
} from '@/infra/http/swagger/swagger.decorators'
import { OrdersResponseDto } from '@/infra/http/swagger/swagger.models'
import {
  NearbyQuerySchema,
  nearbyQueryValidationPipe,
} from './dtos/nearby-query.dto'

@Controller('orders')
@ApiTags('Orders')
export class ListOrdersNearbyController {
  constructor(private listOrdersNearby: ListOrdersNearbyUseCase) {}

  @Get('nearby')
  @ApiOperation({
    summary: 'List nearby waiting orders for the authenticated deliveryman',
  })
  @ApiJwtAuth()
  @ApiNearbyOrdersQuery()
  @ApiOkResponse({ type: OrdersResponseDto })
  @ApiForbiddenErrorResponse('Only deliverymen can list nearby orders.')
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
