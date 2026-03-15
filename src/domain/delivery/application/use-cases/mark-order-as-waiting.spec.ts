import { InMemoryOrdersRepository } from 'test/repositories/in-memory-orders-repository'
import { MarkOrderAsWaitingUseCase } from './mark-order-as-waiting'
import { makeOrder } from 'test/factories/make-order'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { NotAllowedError } from '@/core/errors/errors/not-allowed-error'

let inMemoryOrdersRepository: InMemoryOrdersRepository
let sut: MarkOrderAsWaitingUseCase

describe('Mark Order As Waiting', () => {
  beforeEach(() => {
    inMemoryOrdersRepository = new InMemoryOrdersRepository()
    sut = new MarkOrderAsWaitingUseCase(inMemoryOrdersRepository)
  })

  it('should mark order as waiting', async () => {
    const deliverymanId = new UniqueEntityId()
    const order = makeOrder({ status: 'pickedUp', deliverymanId })
    await inMemoryOrdersRepository.create(order)

    const result = await sut.execute({ orderId: order.id.toString() })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.order.status).toBe('waiting')
      expect(result.value.order.deliverymanId).toBeNull()
    }
  })

  it('should not mark when order does not exist', async () => {
    const result = await sut.execute({
      orderId: '00000000-0000-0000-0000-000000000000',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not move delivered orders back to waiting', async () => {
    const order = makeOrder({ status: 'delivered' })
    await inMemoryOrdersRepository.create(order)

    const result = await sut.execute({ orderId: order.id.toString() })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(NotAllowedError)
  })
})
