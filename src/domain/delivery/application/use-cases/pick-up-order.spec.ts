import { InMemoryOrdersRepository } from 'test/repositories/in-memory-orders-repository'
import { PickUpOrderUseCase } from './pick-up-order'
import { makeOrder } from 'test/factories/make-order'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { NotAllowedError } from '@/core/errors/errors/not-allowed-error'

let inMemoryOrdersRepository: InMemoryOrdersRepository
let sut: PickUpOrderUseCase

describe('Pick Up Order', () => {
  beforeEach(() => {
    inMemoryOrdersRepository = new InMemoryOrdersRepository()
    sut = new PickUpOrderUseCase(inMemoryOrdersRepository)
  })

  it('should pick up order', async () => {
    const deliverymanId = new UniqueEntityId()
    const order = makeOrder({ status: 'waiting' })
    await inMemoryOrdersRepository.create(order)

    const result = await sut.execute({
      orderId: order.id.toString(),
      deliverymanId: deliverymanId.toString(),
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.order.status).toBe('pickedUp')
      expect(result.value.order.deliverymanId?.toString()).toBe(
        deliverymanId.toString(),
      )
    }
  })

  it('should not pick up when order does not exist', async () => {
    const result = await sut.execute({
      orderId: '00000000-0000-0000-0000-000000000000',
      deliverymanId: 'deliveryman-1',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not pick up when order is not waiting', async () => {
    const order = makeOrder({ status: 'pickedUp' })
    await inMemoryOrdersRepository.create(order)

    const result = await sut.execute({
      orderId: order.id.toString(),
      deliverymanId: 'deliveryman-1',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(NotAllowedError)
  })
})
