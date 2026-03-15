import {
  BadRequestException,
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { ListOrdersUseCase } from '@/domain/delivery/application/use-cases/list-orders'
import { IsAdmin } from '@/infra/auth/is-admin.decorator'
import { IsAdminGuard } from '@/infra/auth/is-admin.guard'
import {
  PaginationQuerySchema,
  paginationQueryValidationPipe,
} from '@/infra/http/common/dtos/pagination-query.dto'
import { OrderWithPaginationPresenter } from '@/infra/http/presenters/order-with-pagination-presenter'
import {
  ApiAdminAuth,
  ApiPaginationQuery,
  ApiValidationErrorResponse,
} from '@/infra/http/swagger/swagger.decorators'
import { OrdersResponseDto } from '@/infra/http/swagger/swagger.models'

@Controller('orders')
@UseGuards(IsAdminGuard)
@ApiTags('Orders')
export class ListOrdersController {
  constructor(private listOrders: ListOrdersUseCase) {}

  @Get()
  @IsAdmin()
  @ApiOperation({ summary: 'List orders' })
  @ApiAdminAuth()
  @ApiPaginationQuery()
  @ApiOkResponse({ type: OrdersResponseDto })
  @ApiValidationErrorResponse()
  async handle(
    @Query(paginationQueryValidationPipe) query: PaginationQuerySchema,
  ) {
    const result = await this.listOrders.execute({
      page: query.page,
      perPage: query.perPage,
    })

    if (result.isLeft()) {
      throw new BadRequestException()
    }

    return OrderWithPaginationPresenter.toHTTP(result.value.orders)
  }
}
