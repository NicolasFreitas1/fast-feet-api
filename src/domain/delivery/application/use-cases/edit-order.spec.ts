import { InMemoryOrdersRepository } from 'test/repositories/in-memory-orders-repository'
import { InMemoryRecipientRepository } from 'test/repositories/in-memory-recipients-repository'
import { EditOrderUseCase } from './edit-order'
import { makeOrder } from 'test/factories/make-order'
import { makeRecipient } from 'test/factories/make-recipient'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'

let inMemoryOrdersRepository: InMemoryOrdersRepository
let inMemoryRecipientsRepository: InMemoryRecipientRepository
let sut: EditOrderUseCase

describe('Edit Order', () => {
  beforeEach(() => {
    inMemoryOrdersRepository = new InMemoryOrdersRepository()
    inMemoryRecipientsRepository = new InMemoryRecipientRepository()
    sut = new EditOrderUseCase(
      inMemoryOrdersRepository,
      inMemoryRecipientsRepository,
    )
  })

  it('should edit order name', async () => {
    const order = makeOrder({ name: 'Order 1' })
    await inMemoryOrdersRepository.create(order)

    const result = await sut.execute({
      orderId: order.id.toString(),
      name: 'Order 2',
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.order.name).toBe('Order 2')
      expect(inMemoryOrdersRepository.items[0].name).toBe('Order 2')
    }
  })

  it('should edit order recipient', async () => {
    const recipient1 = makeRecipient()
    const recipient2 = makeRecipient()
    await inMemoryRecipientsRepository.create(recipient1)
    await inMemoryRecipientsRepository.create(recipient2)
    const order = makeOrder({ recipientId: recipient1.id })
    await inMemoryOrdersRepository.create(order)

    const result = await sut.execute({
      orderId: order.id.toString(),
      recipientId: recipient2.id.toString(),
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.order.recipientId.toString()).toBe(
        recipient2.id.toString(),
      )
    }
  })

  it('should not edit when order does not exist', async () => {
    const result = await sut.execute({
      orderId: '00000000-0000-0000-0000-000000000000',
      name: 'Order 2',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not edit when recipient does not exist', async () => {
    const order = makeOrder()
    await inMemoryOrdersRepository.create(order)

    const result = await sut.execute({
      orderId: order.id.toString(),
      recipientId: '00000000-0000-0000-0000-000000000000',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
