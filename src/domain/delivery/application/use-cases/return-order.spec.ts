import { InMemoryOrdersRepository } from 'test/repositories/in-memory-orders-repository'
import { ReturnOrderUseCase } from './return-order'
import { makeOrder } from 'test/factories/make-order'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { NotAllowedError } from '@/core/errors/errors/not-allowed-error'

let inMemoryOrdersRepository: InMemoryOrdersRepository
let sut: ReturnOrderUseCase

describe('Return Order', () => {
  beforeEach(() => {
    inMemoryOrdersRepository = new InMemoryOrdersRepository()
    sut = new ReturnOrderUseCase(inMemoryOrdersRepository)
  })

  it('should return order', async () => {
    const deliverymanId = new UniqueEntityId()
    const order = makeOrder({
      status: 'pickedUp',
      deliverymanId,
    })
    await inMemoryOrdersRepository.create(order)

    const result = await sut.execute({
      orderId: order.id.toString(),
      deliverymanId: deliverymanId.toString(),
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.order.status).toBe('returned')
    }
  })

  it('should not return when order does not exist', async () => {
    const result = await sut.execute({
      orderId: '00000000-0000-0000-0000-000000000000',
      deliverymanId: 'deliveryman-1',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not return when order is assigned to another deliveryman', async () => {
    const deliverymanId = new UniqueEntityId()
    const order = makeOrder({
      status: 'pickedUp',
      deliverymanId,
    })
    await inMemoryOrdersRepository.create(order)

    const result = await sut.execute({
      orderId: order.id.toString(),
      deliverymanId: new UniqueEntityId().toString(),
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(NotAllowedError)
  })

  it('should not return delivered orders', async () => {
    const deliverymanId = new UniqueEntityId()
    const order = makeOrder({
      status: 'delivered',
      deliverymanId,
    })
    await inMemoryOrdersRepository.create(order)

    const result = await sut.execute({
      orderId: order.id.toString(),
      deliverymanId: deliverymanId.toString(),
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(NotAllowedError)
  })
})
