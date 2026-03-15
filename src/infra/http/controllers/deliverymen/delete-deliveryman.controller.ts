import {
  BadRequestException,
  Controller,
  Delete,
  HttpCode,
  NotFoundException,
  Param,
  UseGuards,
} from '@nestjs/common'
import { ApiNoContentResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { DeleteDeliverymanUseCase } from '@/domain/delivery/application/use-cases/delete-deliveryman'
import { IsAdmin } from '@/infra/auth/is-admin.decorator'
import { IsAdminGuard } from '@/infra/auth/is-admin.guard'
import {
  ApiAdminAuth,
  ApiResourceNotFoundResponse,
  ApiUuidParam,
  ApiValidationErrorResponse,
} from '@/infra/http/swagger/swagger.decorators'

@Controller('deliverymen/:id')
@UseGuards(IsAdminGuard)
@ApiTags('Deliverymen')
export class DeleteDeliverymanController {
  constructor(private deleteDeliveryman: DeleteDeliverymanUseCase) {}

  @Delete()
  @IsAdmin()
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a deliveryman' })
  @ApiAdminAuth()
  @ApiUuidParam('id', 'Deliveryman identifier.')
  @ApiNoContentResponse({ description: 'Deliveryman deleted successfully.' })
  @ApiValidationErrorResponse()
  @ApiResourceNotFoundResponse('Deliveryman not found.')
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
