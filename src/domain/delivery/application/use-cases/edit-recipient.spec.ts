import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { makeRecipient } from 'test/factories/make-recipient'
import { InMemoryRecipientRepository } from 'test/repositories/in-memory-recipients-repository'
import { EditRecipientUseCase } from './edit-recipient'

let inMemoryRecipientRepository: InMemoryRecipientRepository
let sut: EditRecipientUseCase

describe('Edit Recipient', () => {
  beforeEach(() => {
    inMemoryRecipientRepository = new InMemoryRecipientRepository()

    sut = new EditRecipientUseCase(inMemoryRecipientRepository)
  })

  it('should be able to edit a Recipient', async () => {
    const recipient = makeRecipient({ name: 'example-name' })

    await inMemoryRecipientRepository.create(recipient)

    const result = await sut.execute({
      recipientId: recipient.id.toString(),
      address: 'edited-address',
      name: 'edited-name',
      phone: '1-123456',
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(inMemoryRecipientRepository.items[0].name).toEqual('edited-name')
    }
  })

  it('should be not able to edit a non existent Recipient', async () => {
    const result = await sut.execute({
      recipientId: 'not-existent-recipient',
      address: 'edited-address',
      name: 'edited-name',
      phone: '1-123456',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
