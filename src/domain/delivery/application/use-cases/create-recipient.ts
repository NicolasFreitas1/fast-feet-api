import { Either, left, right } from 'src/core/either'
import { RecipientAlreadyExistsError } from './errors/recipient-already-exists-error'
import { Recipient } from '../../enterprise/recipient'
import { Injectable } from '@nestjs/common'
import { RecipientsRepository } from '../repository/recipients-repository'

interface CreateRecipientUseCaseRequest {
  name: string
  address: string
  phone: string
  cpf: string
  latitude: number
  longitude: number
}

type CreateRecipientUseCaseResponse = Either<
  RecipientAlreadyExistsError,
  {
    recipient: Recipient
  }
>

@Injectable()
export class CreateRecipientUseCase {
  constructor(private recipientsRepository: RecipientsRepository) {}

  async execute({
    name,
    address,
    phone,
    cpf,
    latitude,
    longitude,
  }: CreateRecipientUseCaseRequest): Promise<CreateRecipientUseCaseResponse> {
    const recipientExists = await this.recipientsRepository.findByCPF(cpf)

    if (recipientExists) {
      return left(new RecipientAlreadyExistsError(cpf))
    }

    const recipient = Recipient.create({
      name,
      address,
      phone,
      cpf,
      latitude,
      longitude,
    })

    await this.recipientsRepository.create(recipient)

    return right({
      recipient,
    })
  }
}
