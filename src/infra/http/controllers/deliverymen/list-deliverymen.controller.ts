import {
  BadRequestException,
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { ListDeliverymenUseCase } from '@/domain/delivery/application/use-cases/list-deliverymen'
import { IsAdmin } from '@/infra/auth/is-admin.decorator'
import { IsAdminGuard } from '@/infra/auth/is-admin.guard'
import { DeliverymanWithPaginationPresenter } from '@/infra/http/presenters/deliveryman-with-pagination-presenter'
import {
  ApiAdminAuth,
  ApiPaginationQuery,
  ApiValidationErrorResponse,
} from '@/infra/http/swagger/swagger.decorators'
import { DeliverymenResponseDto } from '@/infra/http/swagger/swagger.models'
import {
  PaginationQuerySchema,
  paginationQueryValidationPipe,
} from '@/infra/http/common/dtos/pagination-query.dto'

@Controller('deliverymen')
@UseGuards(IsAdminGuard)
@ApiTags('Deliverymen')
export class ListDeliverymenController {
  constructor(private listDeliverymen: ListDeliverymenUseCase) {}

  @Get()
  @IsAdmin()
  @ApiOperation({ summary: 'List deliverymen' })
  @ApiAdminAuth()
  @ApiPaginationQuery()
  @ApiOkResponse({ type: DeliverymenResponseDto })
  @ApiValidationErrorResponse()
  async handle(
    @Query(paginationQueryValidationPipe) query: PaginationQuerySchema,
  ) {
    const result = await this.listDeliverymen.execute({
      page: query.page,
      perPage: query.perPage,
    })

    if (result.isLeft()) {
      throw new BadRequestException()
    }

    return DeliverymanWithPaginationPresenter.toHTTP(result.value.deliverymen)
  }
}
