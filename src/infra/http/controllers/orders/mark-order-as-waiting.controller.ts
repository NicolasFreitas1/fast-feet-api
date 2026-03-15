import {
  BadRequestException,
  Controller,
  ForbiddenException,
  NotFoundException,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common'
import { NotAllowedError } from '@/core/errors/errors/not-allowed-error'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { MarkOrderAsWaitingUseCase } from '@/domain/delivery/application/use-cases/mark-order-as-waiting'
import { IsAdmin } from '@/infra/auth/is-admin.decorator'
import { IsAdminGuard } from '@/infra/auth/is-admin.guard'
import { OrderPresenter } from '@/infra/http/presenters/order-presenter'

@Controller('orders/:id')
@UseGuards(IsAdminGuard)
export class MarkOrderAsWaitingController {
  constructor(private markOrderAsWaiting: MarkOrderAsWaitingUseCase) {}

  @Patch('waiting')
  @IsAdmin()
  async handle(@Param('id') id: string) {
    const result = await this.markOrderAsWaiting.execute({ orderId: id })

    if (result.isLeft()) {
      const error = result.value
      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new NotFoundException('Order not found')
        case NotAllowedError:
          throw new ForbiddenException(
            'Delivered orders cannot be moved back to waiting',
          )
        default:
          throw new BadRequestException()
      }
    }

    return OrderPresenter.toHTTP(result.value.order)
  }
}
