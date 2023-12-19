import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { makeRecipient } from 'test/factories/make-recipient'
import { InMemoryRecipientRepository } from 'test/repositories/in-memory-recipients-repository'

import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { GetRecipientByIdUseCase } from './get-recipient-by-id'

let inMemoryRecipientRepository: InMemoryRecipientRepository
let sut: GetRecipientByIdUseCase

describe('Get Recipient by Id', () => {
  beforeEach(() => {
    inMemoryRecipientRepository = new InMemoryRecipientRepository()

    sut = new GetRecipientByIdUseCase(inMemoryRecipientRepository)
  })

  it('should be able to get a Recipient by Id', async () => {
    const recipient = makeRecipient(
      { name: 'example-name' },
      new UniqueEntityId('1'),
    )

    await inMemoryRecipientRepository.create(recipient)

    const result = await sut.execute({
      recipientId: '1',
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.recipient).toEqual(
        expect.objectContaining({ name: 'example-name' }),
      )
    }
  })

  it('should be not able to edit a non existent Recipient', async () => {
    const result = await sut.execute({
      recipientId: 'not-existent-recipient',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
