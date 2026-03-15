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
import { DeleteOrderUseCase } from '@/domain/delivery/application/use-cases/delete-order'
import { IsAdmin } from '@/infra/auth/is-admin.decorator'
import { IsAdminGuard } from '@/infra/auth/is-admin.guard'
import {
  ApiAdminAuth,
  ApiResourceNotFoundResponse,
  ApiUuidParam,
  ApiValidationErrorResponse,
} from '@/infra/http/swagger/swagger.decorators'

@Controller('orders/:id')
@UseGuards(IsAdminGuard)
@ApiTags('Orders')
export class DeleteOrderController {
  constructor(private deleteOrder: DeleteOrderUseCase) {}

  @Delete()
  @IsAdmin()
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete an order' })
  @ApiAdminAuth()
  @ApiUuidParam('id', 'Order identifier.')
  @ApiNoContentResponse({ description: 'Order deleted successfully.' })
  @ApiValidationErrorResponse()
  @ApiResourceNotFoundResponse('Order not found.')
  async handle(@Param('id') id: string) {
    const result = await this.deleteOrder.execute({ orderId: id })

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
