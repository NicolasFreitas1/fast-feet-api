import { Either, left, right } from '@/core/either'
import { ResourceNotFoundError } from '../../../../core/errors/errors/resource-not-found-error'

import { RecipientsRepository } from '../repository/recipients-repository'

import { Injectable } from '@nestjs/common'
import { Recipient } from '../../enterprise/recipient'

interface EditRecipientUseCaseRequest {
  recipientId: string
  address: string
  name: string
  phone: string
}

type EditRecipientUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    recipient: Recipient
  }
>

@Injectable()
export class EditRecipientUseCase {
  constructor(private recipientsRepository: RecipientsRepository) {}

  async execute({
    recipientId,
    address,
    name,
    phone,
  }: EditRecipientUseCaseRequest): Promise<EditRecipientUseCaseResponse> {
    const recipient = await this.recipientsRepository.findById(recipientId)

    if (!recipient) {
      return left(new ResourceNotFoundError())
    }

    recipient.address = address
    recipient.name = name
    recipient.phone = phone

    await this.recipientsRepository.save(recipient)

    return right({
      recipient,
    })
  }
}
