import { InMemoryOrdersRepository } from 'test/repositories/in-memory-orders-repository'
import { GetOrderByIdUseCase } from './get-order-by-id'
import { makeOrder } from 'test/factories/make-order'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'

let inMemoryOrdersRepository: InMemoryOrdersRepository
let sut: GetOrderByIdUseCase

describe('Get Order By Id', () => {
  beforeEach(() => {
    inMemoryOrdersRepository = new InMemoryOrdersRepository()
    sut = new GetOrderByIdUseCase(inMemoryOrdersRepository)
  })

  it('should get order by id', async () => {
    const order = makeOrder({ name: 'Order 1' })
    await inMemoryOrdersRepository.create(order)

    const result = await sut.execute({ orderId: order.id.toString() })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.order.id.toString()).toBe(order.id.toString())
      expect(result.value.order.name).toBe('Order 1')
    }
  })

  it('should get order by id when deliverymanId matches', async () => {
    const deliverymanId = new UniqueEntityId()
    const order = makeOrder({ deliverymanId })
    await inMemoryOrdersRepository.create(order)

    const result = await sut.execute({
      orderId: order.id.toString(),
      deliverymanId: deliverymanId.toString(),
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.order.id.toString()).toBe(order.id.toString())
    }
  })

  it('should not get order when deliverymanId does not match', async () => {
    const deliverymanId = new UniqueEntityId()
    const order = makeOrder({ deliverymanId })
    await inMemoryOrdersRepository.create(order)

    const result = await sut.execute({
      orderId: order.id.toString(),
      deliverymanId: '00000000-0000-0000-0000-000000000000',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not get when order does not exist', async () => {
    const result = await sut.execute({
      orderId: '00000000-0000-0000-0000-000000000000',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
