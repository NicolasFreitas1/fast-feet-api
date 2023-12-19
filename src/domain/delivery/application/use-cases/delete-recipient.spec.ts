import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { makeRecipient } from 'test/factories/make-recipient'
import { InMemoryRecipientRepository } from 'test/repositories/in-memory-recipients-repository'
import { DeleteRecipientUseCase } from './delete-recipient'

let inMemoryRecipientRepository: InMemoryRecipientRepository
let sut: DeleteRecipientUseCase

describe('Delete Recipient', () => {
  beforeEach(() => {
    inMemoryRecipientRepository = new InMemoryRecipientRepository()

    sut = new DeleteRecipientUseCase(inMemoryRecipientRepository)
  })

  it('should be able to delete a Recipient', async () => {
    const recipient = makeRecipient({ name: 'example-name' })

    await inMemoryRecipientRepository.create(recipient)

    const result = await sut.execute({
      recipientId: recipient.id.toString(),
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(inMemoryRecipientRepository.items).toHaveLength(0)
    }
  })

  it('should be not able to delete a non existent Recipient', async () => {
    const result = await sut.execute({
      recipientId: 'not-existent-recipient',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
