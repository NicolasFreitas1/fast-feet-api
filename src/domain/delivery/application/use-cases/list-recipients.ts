import { Either, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { Recipient } from '../../enterprise/recipient'
import { RecipientsRepository } from '../repository/recipients-repository'

interface ListRecipientsUseCaseRequest {
  page: number
  perPage: number
}

type ListRecipientsUseCaseResponse = Either<
  null,
  {
    recipients: Recipient[]
  }
>

@Injectable()
export class ListRecipientsUseCase {
  constructor(private recipientsRepository: RecipientsRepository) {}

  async execute({
    page,
    perPage,
  }: ListRecipientsUseCaseRequest): Promise<ListRecipientsUseCaseResponse> {
    const recipients = await this.recipientsRepository.findMany({
      page,
      perPage,
    })

    return right({
      recipients,
    })
  }
}
