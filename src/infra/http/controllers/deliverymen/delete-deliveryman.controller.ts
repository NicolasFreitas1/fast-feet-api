import {
  BadRequestException,
  Controller,
  Delete,
  HttpCode,
  NotFoundException,
  Param,
  UseGuards,
} from '@nestjs/common'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { DeleteDeliverymanUseCase } from '@/domain/delivery/application/use-cases/delete-deliveryman'
import { IsAdmin } from '@/infra/auth/is-admin.decorator'
import { IsAdminGuard } from '@/infra/auth/is-admin.guard'

@Controller('deliverymen/:id')
@UseGuards(IsAdminGuard)
export class DeleteDeliverymanController {
  constructor(private deleteDeliveryman: DeleteDeliverymanUseCase) {}

  @Delete()
  @IsAdmin()
  @HttpCode(204)
  async handle(@Param('id') id: string) {
    const result = await this.deleteDeliveryman.execute({ deliverymanId: id })

    if (result.isLeft()) {
      const error = result.value
      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new NotFoundException(error.message)
        default:
          throw new BadRequestException()
      }
    }
  }
}
