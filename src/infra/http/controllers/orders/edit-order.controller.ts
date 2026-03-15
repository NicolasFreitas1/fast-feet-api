import {
  BadRequestException,
  Body,
  Controller,
  NotFoundException,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common'
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { EditOrderUseCase } from '@/domain/delivery/application/use-cases/edit-order'
import { IsAdmin } from '@/infra/auth/is-admin.decorator'
import { IsAdminGuard } from '@/infra/auth/is-admin.guard'
import { OrderPresenter } from '@/infra/http/presenters/order-presenter'
import {
  ApiAdminAuth,
  ApiResourceNotFoundResponse,
  ApiUuidParam,
  ApiValidationErrorResponse,
} from '@/infra/http/swagger/swagger.decorators'
import {
  EditOrderRequestDto,
  OrderResponseDto,
} from '@/infra/http/swagger/swagger.models'
import {
  EditOrderBodySchema,
  editOrderBodyValidationPipe,
} from './dtos/edit-order.dto'

@Controller('orders/:id')
@UseGuards(IsAdminGuard)
@ApiTags('Orders')
export class EditOrderController {
  constructor(private editOrder: EditOrderUseCase) {}

  @Put()
  @IsAdmin()
  @ApiOperation({ summary: 'Update an order' })
  @ApiAdminAuth()
  @ApiUuidParam('id', 'Order identifier.')
  @ApiBody({ type: EditOrderRequestDto })
  @ApiOkResponse({ type: OrderResponseDto })
  @ApiValidationErrorResponse()
  @ApiResourceNotFoundResponse(
    'Order not found or recipient identifier does not exist.',
  )
  async handle(
    @Param('id') id: string,
    @Body(editOrderBodyValidationPipe) body: EditOrderBodySchema,
  ) {
    const result = await this.editOrder.execute({
      orderId: id,
      name: body.name,
      recipientId: body.recipientId,
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
