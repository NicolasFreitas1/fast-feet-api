import { InMemoryOrdersRepository } from 'test/repositories/in-memory-orders-repository'
import { ListOrdersUseCase } from './list-orders'
import { makeOrder } from 'test/factories/make-order'

let inMemoryOrdersRepository: InMemoryOrdersRepository
let sut: ListOrdersUseCase

describe('List Orders', () => {
  beforeEach(() => {
    inMemoryOrdersRepository = new InMemoryOrdersRepository()
    sut = new ListOrdersUseCase(inMemoryOrdersRepository)
  })

  it('should return paginated orders for admin', async () => {
    await inMemoryOrdersRepository.create(
      makeOrder({ name: 'Order 1', createdAt: new Date('2026-01-01T00:00:00Z') }),
    )
    await inMemoryOrdersRepository.create(
      makeOrder({ name: 'Order 2', createdAt: new Date('2026-01-02T00:00:00Z') }),
    )
    await inMemoryOrdersRepository.create(
      makeOrder({ name: 'Order 3', createdAt: new Date('2026-01-03T00:00:00Z') }),
    )

    const result = await sut.execute({ page: 1, perPage: 2 })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.orders).toHaveLength(2)
      expect(result.value.orders.map((o) => o.name)).toEqual([
        'Order 3',
        'Order 2',
      ])
    }
  })

  it('should return empty list when no orders', async () => {
    const result = await sut.execute({ page: 1, perPage: 10 })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.orders).toHaveLength(0)
    }
  })
})
