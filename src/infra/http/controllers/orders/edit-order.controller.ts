import {
  BadRequestException,
  Body,
  Controller,
  NotFoundException,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { EditOrderUseCase } from '@/domain/delivery/application/use-cases/edit-order'
import { IsAdmin } from '@/infra/auth/is-admin.decorator'
import { IsAdminGuard } from '@/infra/auth/is-admin.guard'
import { OrderPresenter } from '@/infra/http/presenters/order-presenter'
import {
  EditOrderBodySchema,
  editOrderBodyValidationPipe,
} from './dtos/edit-order.dto'

@Controller('orders/:id')
@UseGuards(IsAdminGuard)
export class EditOrderController {
  constructor(private editOrder: EditOrderUseCase) {}

  @Put()
  @IsAdmin()
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
