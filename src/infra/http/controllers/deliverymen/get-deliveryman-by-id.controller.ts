import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
  UseGuards,
} from '@nestjs/common'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { GetDeliverymanByIdUseCase } from '@/domain/delivery/application/use-cases/get-deliveryman-by-id'
import { IsAdmin } from '@/infra/auth/is-admin.decorator'
import { IsAdminGuard } from '@/infra/auth/is-admin.guard'
import { DeliverymanPresenter } from '@/infra/http/presenters/deliveryman-presenter'

@Controller('deliverymen/:id')
@UseGuards(IsAdminGuard)
export class GetDeliverymanByIdController {
  constructor(private getDeliverymanById: GetDeliverymanByIdUseCase) {}

  @Get()
  @IsAdmin()
  async handle(@Param('id') id: string) {
    const result = await this.getDeliverymanById.execute({ deliverymanId: id })

    if (result.isLeft()) {
      const error = result.value
      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new NotFoundException(error.message)
        default:
          throw new BadRequestException()
      }
    }

    return DeliverymanPresenter.toHTTP(result.value.deliveryman)
  }
}
