import { InMemoryOrdersRepository } from 'test/repositories/in-memory-orders-repository'
import { ListMyDeliveriesUseCase } from './list-my-deliveries'
import { makeOrder } from 'test/factories/make-order'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'

let inMemoryOrdersRepository: InMemoryOrdersRepository
let sut: ListMyDeliveriesUseCase

describe('List My Deliveries', () => {
  beforeEach(() => {
    inMemoryOrdersRepository = new InMemoryOrdersRepository()
    sut = new ListMyDeliveriesUseCase(inMemoryOrdersRepository)
  })

  it('should return orders for deliveryman', async () => {
    const deliverymanId = new UniqueEntityId()
    const order1 = makeOrder({ name: 'Order 1', deliverymanId })
    const order2 = makeOrder({ name: 'Order 2', deliverymanId })
    await inMemoryOrdersRepository.create(order1)
    await inMemoryOrdersRepository.create(order2)

    const result = await sut.execute({
      deliverymanId: deliverymanId.toString(),
      page: 1,
      perPage: 10,
    })

    expect(result.orders).toHaveLength(2)
    expect(result.orders.map((o) => o.name)).toEqual(
      expect.arrayContaining(['Order 1', 'Order 2']),
    )
  })

  it('should not return orders from other deliverymen', async () => {
    const deliverymanId = new UniqueEntityId()
    const otherDeliverymanId = new UniqueEntityId()
    await inMemoryOrdersRepository.create(
      makeOrder({ name: 'My Order', deliverymanId }),
    )
    await inMemoryOrdersRepository.create(
      makeOrder({ name: 'Other Order', deliverymanId: otherDeliverymanId }),
    )

    const result = await sut.execute({
      deliverymanId: deliverymanId.toString(),
      page: 1,
      perPage: 10,
    })

    expect(result.orders).toHaveLength(1)
    expect(result.orders[0].name).toBe('My Order')
  })

  it('should return empty list when deliveryman has no orders', async () => {
    const result = await sut.execute({
      deliverymanId: '00000000-0000-0000-0000-000000000000',
      page: 1,
      perPage: 10,
    })

    expect(result.orders).toHaveLength(0)
  })
})
