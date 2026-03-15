import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
  UseGuards,
} from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { GetRecipientByIdUseCase } from '@/domain/delivery/application/use-cases/get-recipient-by-id'
import { IsAdmin } from '@/infra/auth/is-admin.decorator'
import { IsAdminGuard } from '@/infra/auth/is-admin.guard'
import { RecipientPresenter } from '@/infra/http/presenters/recipient-presenter'
import {
  ApiAdminAuth,
  ApiResourceNotFoundResponse,
  ApiUuidParam,
  ApiValidationErrorResponse,
} from '@/infra/http/swagger/swagger.decorators'
import { RecipientResponseDto } from '@/infra/http/swagger/swagger.models'

@Controller('recipients/:id')
@UseGuards(IsAdminGuard)
@ApiTags('Recipients')
export class GetRecipientByIdController {
  constructor(private getRecipientById: GetRecipientByIdUseCase) {}

  @Get()
  @IsAdmin()
  @ApiOperation({ summary: 'Get a recipient by id' })
  @ApiAdminAuth()
  @ApiUuidParam('id', 'Recipient identifier.')
  @ApiOkResponse({ type: RecipientResponseDto })
  @ApiValidationErrorResponse()
  @ApiResourceNotFoundResponse('Recipient not found.')
  async handle(@Param('id') id: string) {
    const result = await this.getRecipientById.execute({ recipientId: id })

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
