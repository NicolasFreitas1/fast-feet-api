import {
  BadRequestException,
  Controller,
  ForbiddenException,
  NotFoundException,
  Param,
  Patch,
} from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { PickUpOrderUseCase } from '@/domain/delivery/application/use-cases/pick-up-order'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { NotAllowedError } from '@/core/errors/errors/not-allowed-error'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import { OrderPresenter } from '@/infra/http/presenters/order-presenter'
import {
  ApiForbiddenErrorResponse,
  ApiJwtAuth,
  ApiResourceNotFoundResponse,
  ApiUuidParam,
  ApiValidationErrorResponse,
} from '@/infra/http/swagger/swagger.decorators'
import { OrderResponseDto } from '@/infra/http/swagger/swagger.models'

@Controller('orders/:id')
@ApiTags('Orders')
export class PickUpOrderController {
  constructor(private pickUpOrder: PickUpOrderUseCase) {}

  @Patch('pick-up')
  @ApiOperation({ summary: 'Pick up an available order' })
  @ApiJwtAuth()
  @ApiUuidParam('id', 'Order identifier.')
  @ApiOkResponse({ type: OrderResponseDto })
  @ApiValidationErrorResponse()
  @ApiResourceNotFoundResponse('Order not found.')
  @ApiForbiddenErrorResponse(
    'Only deliverymen can pick up orders or the order is not available for pickup.',
  )
  async handle(@Param('id') id: string, @CurrentUser() user: UserPayload) {
    if (user.userRole !== 'DELIVERYMAN') {
      throw new ForbiddenException('Only deliverymen can pick up orders')
    }
    const result = await this.pickUpOrder.execute({
      orderId: id,
      deliverymanId: user.sub,
    })

    if (result.isLeft()) {
      const error = result.value
      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new NotFoundException('Order not found')
        case NotAllowedError:
          throw new ForbiddenException('Order is not available for pickup')
        default:
          throw new BadRequestException()
      }
    }

    return OrderPresenter.toHTTP(result.value.order)
  }
}
