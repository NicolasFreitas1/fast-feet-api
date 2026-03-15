import { InMemoryOrdersRepository } from 'test/repositories/in-memory-orders-repository'
import { InMemoryRecipientRepository } from 'test/repositories/in-memory-recipients-repository'
import { CreateOrderUseCase } from './create-order'
import { makeRecipient } from 'test/factories/make-recipient'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'

let inMemoryOrdersRepository: InMemoryOrdersRepository
let inMemoryRecipientsRepository: InMemoryRecipientRepository
let sut: CreateOrderUseCase

describe('Create Order', () => {
  beforeEach(() => {
    inMemoryOrdersRepository = new InMemoryOrdersRepository()
    inMemoryRecipientsRepository = new InMemoryRecipientRepository()
    sut = new CreateOrderUseCase(
      inMemoryOrdersRepository,
      inMemoryRecipientsRepository,
    )
  })

  it('should create an order', async () => {
    const recipient = makeRecipient()
    await inMemoryRecipientsRepository.create(recipient)

    const result = await sut.execute({
      name: 'Order 1',
      recipientId: recipient.id.toString(),
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(inMemoryOrdersRepository.items).toHaveLength(1)
      expect(inMemoryOrdersRepository.items[0].name).toBe('Order 1')
      expect(inMemoryOrdersRepository.items[0].status).toBe('waiting')
      expect(inMemoryOrdersRepository.items[0].recipientId.toString()).toBe(
        recipient.id.toString(),
      )
    }
  })

  it('should not create order when recipient does not exist', async () => {
    const result = await sut.execute({
      name: 'Order 1',
      recipientId: '00000000-0000-0000-0000-000000000000',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
