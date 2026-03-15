import { EditRecipientUseCase } from '@/domain/delivery/application/use-cases/edit-recipient'
import { IsAdmin } from '@/infra/auth/is-admin.decorator'
import { IsAdminGuard } from '@/infra/auth/is-admin.guard'
import { RecipientPresenter } from '@/infra/http/presenters/recipient-presenter'
import {
  ApiAdminAuth,
  ApiResourceNotFoundResponse,
  ApiUuidParam,
  ApiValidationErrorResponse,
} from '@/infra/http/swagger/swagger.decorators'
import {
  EditRecipientRequestDto,
  RecipientResponseDto,
} from '@/infra/http/swagger/swagger.models'
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
import {
  EditRecipientBodySchema,
  editRecipientBodyValidationPipe,
} from './dtos/edit-recipient.dto'

@Controller('recipients/:id')
@UseGuards(IsAdminGuard)
@ApiTags('Recipients')
export class EditRecipientController {
  constructor(private editRecipient: EditRecipientUseCase) {}

  @Put()
  @IsAdmin()
  @ApiOperation({ summary: 'Update a recipient' })
  @ApiAdminAuth()
  @ApiUuidParam('id', 'Recipient identifier.')
  @ApiBody({ type: EditRecipientRequestDto })
  @ApiOkResponse({ type: RecipientResponseDto })
  @ApiValidationErrorResponse()
  @ApiResourceNotFoundResponse('Recipient not found.')
  async handle(
    @Param('id') id: string,
    @Body(editRecipientBodyValidationPipe) body: EditRecipientBodySchema,
  ) {
    const result = await this.editRecipient.execute({
      recipientId: id,
      name: body.name,
      address: body.address,
      phone: body.phone,
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

    return RecipientPresenter.toHTTP(result.value.recipient)
  }
}
