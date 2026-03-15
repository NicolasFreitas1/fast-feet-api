import { Controller, ForbiddenException, Get, Query } from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { ListMyDeliveriesUseCase } from '@/domain/delivery/application/use-cases/list-my-deliveries'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import { OrderWithPaginationPresenter } from '@/infra/http/presenters/order-with-pagination-presenter'
import {
  ApiForbiddenErrorResponse,
  ApiJwtAuth,
  ApiPaginationQuery,
} from '@/infra/http/swagger/swagger.decorators'
import { OrdersResponseDto } from '@/infra/http/swagger/swagger.models'
import {
  PaginationQuerySchema,
  paginationQueryValidationPipe,
} from '@/infra/http/common/dtos/pagination-query.dto'

@Controller('orders')
@ApiTags('Orders')
export class ListMyDeliveriesController {
  constructor(private listMyDeliveries: ListMyDeliveriesUseCase) {}

  @Get('my-deliveries')
  @ApiOperation({
    summary: 'List deliveries assigned to the authenticated deliveryman',
  })
  @ApiJwtAuth()
  @ApiPaginationQuery()
  @ApiOkResponse({ type: OrdersResponseDto })
  @ApiForbiddenErrorResponse('Only deliverymen can list their deliveries.')
  async handle(
    @Query(paginationQueryValidationPipe) query: PaginationQuerySchema,
    @CurrentUser() user: UserPayload,
  ) {
    if (user.userRole !== 'DELIVERYMAN') {
      throw new ForbiddenException('Only deliverymen can list their deliveries')
    }
    const result = await this.listMyDeliveries.execute({
      deliverymanId: user.sub,
      page: query.page,
      perPage: query.perPage,
    })

    return OrderWithPaginationPresenter.toHTTP(result.orders)
  }
}
