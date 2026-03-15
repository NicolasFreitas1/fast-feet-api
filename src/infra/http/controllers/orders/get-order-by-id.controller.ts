import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
} from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { GetOrderByIdUseCase } from '@/domain/delivery/application/use-cases/get-order-by-id'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import { OrderPresenter } from '@/infra/http/presenters/order-presenter'
import {
  ApiJwtAuth,
  ApiResourceNotFoundResponse,
  ApiUuidParam,
  ApiValidationErrorResponse,
} from '@/infra/http/swagger/swagger.decorators'
import { OrderResponseDto } from '@/infra/http/swagger/swagger.models'

@Controller('orders/:id')
@ApiTags('Orders')
export class GetOrderByIdController {
  constructor(private getOrderById: GetOrderByIdUseCase) {}

  @Get()
  @ApiOperation({ summary: 'Get an order by id' })
  @ApiJwtAuth()
  @ApiUuidParam('id', 'Order identifier.')
  @ApiOkResponse({ type: OrderResponseDto })
  @ApiValidationErrorResponse()
  @ApiResourceNotFoundResponse('Order not found.')
  async handle(@Param('id') id: string, @CurrentUser() user: UserPayload) {
    const deliverymanId = user.userRole === 'DELIVERYMAN' ? user.sub : undefined
    const result = await this.getOrderById.execute({
      orderId: id,
      deliverymanId,
    })

    if (result.isLeft()) {
      const error = result.value
      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new NotFoundException(error.message)
        default:
          throw new BadRequestException()
      }
    }

    return OrderPresenter.toHTTP(result.value.order)
  }
}
