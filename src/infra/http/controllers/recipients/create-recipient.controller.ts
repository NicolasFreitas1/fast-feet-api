import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  HttpCode,
  Post,
  UseGuards,
} from '@nestjs/common'
import { CreateRecipientUseCase } from '@/domain/delivery/application/use-cases/create-recipient'
import { RecipientAlreadyExistsError } from '@/domain/delivery/application/use-cases/errors/recipient-already-exists-error'
import { IsAdmin } from '@/infra/auth/is-admin.decorator'
import { IsAdminGuard } from '@/infra/auth/is-admin.guard'
import { RecipientPresenter } from '@/infra/http/presenters/recipient-presenter'
import {
  createRecipientBodyValidationPipe,
  CreateRecipientBodySchema,
} from './dtos/create-recipient.dto'

@Controller('recipients')
@UseGuards(IsAdminGuard)
export class CreateRecipientController {
  constructor(private createRecipient: CreateRecipientUseCase) {}

  @Post()
  @IsAdmin()
  @HttpCode(201)
  async handle(
    @Body(createRecipientBodyValidationPipe) body: CreateRecipientBodySchema,
  ) {
    const result = await this.createRecipient.execute(body)

    if (result.isLeft()) {
      const error = result.value
      switch (error.constructor) {
        case RecipientAlreadyExistsError:
          throw new ConflictException('Recipient with this CPF already exists')
        default:
          throw new BadRequestException()
      }
    }

    return RecipientPresenter.toHTTP(result.value.recipient)
  }
}
