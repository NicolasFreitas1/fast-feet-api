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
import { EditDeliverymanUseCase } from '@/domain/delivery/application/use-cases/edit-deliveryman'
import { IsAdmin } from '@/infra/auth/is-admin.decorator'
import { IsAdminGuard } from '@/infra/auth/is-admin.guard'
import { DeliverymanPresenter } from '@/infra/http/presenters/deliveryman-presenter'
import {
  EditDeliverymanBodySchema,
  editDeliverymanBodyValidationPipe,
} from './dtos/edit-deliveryman.dto'

@Controller('deliverymen/:id')
@UseGuards(IsAdminGuard)
export class EditDeliverymanController {
  constructor(private editDeliveryman: EditDeliverymanUseCase) {}

  @Put()
  @IsAdmin()
  async handle(
    @Param('id') id: string,
    @Body(editDeliverymanBodyValidationPipe) body: EditDeliverymanBodySchema,
  ) {
    if (body.name === undefined) {
      throw new BadRequestException('Name is required')
    }
    const result = await this.editDeliveryman.execute({
      deliverymanId: id,
      name: body.name,
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

    return DeliverymanPresenter.toHTTP(result.value.deliveryman)
  }
}
