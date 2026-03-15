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
import { EditDeliverymanUseCase } from '@/domain/delivery/application/use-cases/edit-deliveryman'
import { IsAdmin } from '@/infra/auth/is-admin.decorator'
import { IsAdminGuard } from '@/infra/auth/is-admin.guard'
import { DeliverymanPresenter } from '@/infra/http/presenters/deliveryman-presenter'
import {
  ApiAdminAuth,
  ApiResourceNotFoundResponse,
  ApiUuidParam,
  ApiValidationErrorResponse,
} from '@/infra/http/swagger/swagger.decorators'
import {
  DeliverymanResponseDto,
  EditDeliverymanRequestDto,
} from '@/infra/http/swagger/swagger.models'
import {
  EditDeliverymanBodySchema,
  editDeliverymanBodyValidationPipe,
} from './dtos/edit-deliveryman.dto'

@Controller('deliverymen/:id')
@UseGuards(IsAdminGuard)
@ApiTags('Deliverymen')
export class EditDeliverymanController {
  constructor(private editDeliveryman: EditDeliverymanUseCase) {}

  @Put()
  @IsAdmin()
  @ApiOperation({ summary: 'Update a deliveryman' })
  @ApiAdminAuth()
  @ApiUuidParam('id', 'Deliveryman identifier.')
  @ApiBody({ type: EditDeliverymanRequestDto })
  @ApiOkResponse({ type: DeliverymanResponseDto })
  @ApiValidationErrorResponse('Invalid request data or missing name.')
  @ApiResourceNotFoundResponse('Deliveryman not found.')
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
