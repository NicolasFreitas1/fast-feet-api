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
import { DeleteRecipientUseCase } from '@/domain/delivery/application/use-cases/delete-recipient'
import { IsAdmin } from '@/infra/auth/is-admin.decorator'
import { IsAdminGuard } from '@/infra/auth/is-admin.guard'
import {
  ApiAdminAuth,
  ApiResourceNotFoundResponse,
  ApiUuidParam,
  ApiValidationErrorResponse,
} from '@/infra/http/swagger/swagger.decorators'

@Controller('recipients/:id')
@UseGuards(IsAdminGuard)
@ApiTags('Recipients')
export class DeleteRecipientController {
  constructor(private deleteRecipient: DeleteRecipientUseCase) {}

  @Delete()
  @IsAdmin()
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a recipient' })
  @ApiAdminAuth()
  @ApiUuidParam('id', 'Recipient identifier.')
  @ApiNoContentResponse({ description: 'Recipient deleted successfully.' })
  @ApiValidationErrorResponse()
  @ApiResourceNotFoundResponse('Recipient not found.')
  async handle(@Param('id') id: string) {
    const result = await this.deleteRecipient.execute({ recipientId: id })

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
