import { InMemoryOrdersRepository } from 'test/repositories/in-memory-orders-repository'
import { ListOrdersNearbyUseCase } from './list-orders-nearby'
import { makeOrder } from 'test/factories/make-order'

let inMemoryOrdersRepository: InMemoryOrdersRepository
let sut: ListOrdersNearbyUseCase

describe('List Orders Nearby', () => {
  beforeEach(() => {
    inMemoryOrdersRepository = new InMemoryOrdersRepository()
    sut = new ListOrdersNearbyUseCase(inMemoryOrdersRepository)
  })

  it('should return waiting orders nearby', async () => {
    const order1 = makeOrder({ name: 'Order 1', status: 'waiting' })
    const order2 = makeOrder({ name: 'Order 2', status: 'waiting' })
    await inMemoryOrdersRepository.create(order1)
    await inMemoryOrdersRepository.create(order2)

    const result = await sut.execute({
      latitude: -23.55,
      longitude: -46.63,
      deliverymanId: 'deliveryman-1',
      page: 1,
      perPage: 10,
    })

    expect(result.orders).toHaveLength(2)
    expect(result.orders.map((o) => o.name)).toEqual(
      expect.arrayContaining(['Order 1', 'Order 2']),
    )
  })

  it('should not return orders that are not waiting or already have deliveryman', async () => {
    const waiting = makeOrder({ name: 'Waiting', status: 'waiting' })
    const pickedUp = makeOrder({ name: 'Picked', status: 'pickedUp' })
    await inMemoryOrdersRepository.create(waiting)
    await inMemoryOrdersRepository.create(pickedUp)

    const result = await sut.execute({
      latitude: -23.55,
      longitude: -46.63,
      deliverymanId: 'deliveryman-1',
      page: 1,
      perPage: 10,
    })

    expect(result.orders.every((o) => o.status === 'waiting')).toBe(true)
    expect(result.orders).toHaveLength(1)
    expect(result.orders[0].name).toBe('Waiting')
  })
})
