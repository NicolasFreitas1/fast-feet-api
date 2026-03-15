import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  NotFoundException,
  Post,
  UseGuards,
} from '@nestjs/common'
import { CreateOrderUseCase } from '@/domain/delivery/application/use-cases/create-order'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { IsAdmin } from '@/infra/auth/is-admin.decorator'
import { IsAdminGuard } from '@/infra/auth/is-admin.guard'
import { OrderPresenter } from '@/infra/http/presenters/order-presenter'
import {
  CreateOrderBodySchema,
  createOrderBodyValidationPipe,
} from './dtos/create-order.dto'

@Controller('orders')
@UseGuards(IsAdminGuard)
export class CreateOrderController {
  constructor(private createOrder: CreateOrderUseCase) {}

  @Post()
  @IsAdmin()
  @HttpCode(201)
  async handle(
    @Body(createOrderBodyValidationPipe) body: CreateOrderBodySchema,
  ) {
    const result = await this.createOrder.execute(body)

    if (result.isLeft()) {
      const error = result.value
      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new NotFoundException('Recipient not found')
        default:
          throw new BadRequestException()
      }
    }

    return OrderPresenter.toHTTP(result.value.order)
  }
}
