import {
  BadRequestException,
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common'
import { ListRecipientsUseCase } from '@/domain/delivery/application/use-cases/list-recipients'
import { IsAdmin } from '@/infra/auth/is-admin.decorator'
import { IsAdminGuard } from '@/infra/auth/is-admin.guard'
import { RecipientWithPaginationPresenter } from '@/infra/http/presenters/recipient-with-pagination-presenter'
import {
  paginationQueryValidationPipe,
  PaginationQuerySchema,
} from '@/infra/http/common/dtos/pagination-query.dto'

@Controller('recipients')
@UseGuards(IsAdminGuard)
export class ListRecipientsController {
  constructor(private listRecipients: ListRecipientsUseCase) {}

  @Get()
  @IsAdmin()
  async handle(
    @Query(paginationQueryValidationPipe) query: PaginationQuerySchema,
  ) {
    const result = await this.listRecipients.execute({
      page: query.page,
      perPage: query.perPage,
    })

    if (result.isLeft()) {
      throw new BadRequestException()
    }

    return RecipientWithPaginationPresenter.toHTTP(result.value.recipients)
  }
}
