import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  HttpCode,
  Post,
  UseGuards,
} from '@nestjs/common'
import { CreateDeliverymanUseCase } from '@/domain/delivery/application/use-cases/create-deliveryman'
import { DeliverymanAlreadyExistsError } from '@/domain/delivery/application/use-cases/errors/deliveryman-already-exists-error'
import { IsAdmin } from '@/infra/auth/is-admin.decorator'
import { IsAdminGuard } from '@/infra/auth/is-admin.guard'
import { DeliverymanPresenter } from '@/infra/http/presenters/deliveryman-presenter'
import {
  CreateDeliverymanBodySchema,
  createDeliverymanBodyValidationPipe,
} from './dtos/create-deliveryman.dto'

@Controller('deliverymen')
@UseGuards(IsAdminGuard)
export class CreateDeliverymanController {
  constructor(private createDeliveryman: CreateDeliverymanUseCase) {}

  @Post()
  @IsAdmin()
  @HttpCode(201)
  async handle(
    @Body(createDeliverymanBodyValidationPipe)
    body: CreateDeliverymanBodySchema,
  ) {
    const result = await this.createDeliveryman.execute(body)

    if (result.isLeft()) {
      const error = result.value
      switch (error.constructor) {
        case DeliverymanAlreadyExistsError:
          throw new ConflictException(
            'Deliveryman with this CPF already exists',
          )
        default:
          throw new BadRequestException()
      }
    }

    return DeliverymanPresenter.toHTTP(result.value.deliveryman)
  }
}
