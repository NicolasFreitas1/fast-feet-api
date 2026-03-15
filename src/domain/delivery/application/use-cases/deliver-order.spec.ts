import { InMemoryOrdersRepository } from 'test/repositories/in-memory-orders-repository'
import { DeliverOrderUseCase } from './deliver-order'
import { makeOrder } from 'test/factories/make-order'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { NotAllowedError } from '@/core/errors/errors/not-allowed-error'

let inMemoryOrdersRepository: InMemoryOrdersRepository
let sut: DeliverOrderUseCase

describe('Deliver Order', () => {
  beforeEach(() => {
    inMemoryOrdersRepository = new InMemoryOrdersRepository()
    sut = new DeliverOrderUseCase(inMemoryOrdersRepository)
  })

  it('should deliver an order', async () => {
    const deliverymanId = new UniqueEntityId()
    const order = makeOrder({
      status: 'pickedUp',
      deliverymanId,
    })
    await inMemoryOrdersRepository.create(order)

    const result = await sut.execute({
      orderId: order.id.toString(),
      deliverymanId: deliverymanId.toString(),
      deliveryPhotoUrl: 'https://example.com/photo.jpg',
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.order.status).toBe('delivered')
      expect(result.value.order.deliveryPhotoUrl).toBe(
        'https://example.com/photo.jpg',
      )
    }
  })

  it('should not deliver when order does not exist', async () => {
    const result = await sut.execute({
      orderId: '00000000-0000-0000-0000-000000000000',
      deliverymanId: 'deliveryman-1',
      deliveryPhotoUrl: 'https://example.com/photo.jpg',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not deliver when order is not picked up', async () => {
    const deliverymanId = new UniqueEntityId()
    const order = makeOrder({ status: 'waiting', deliverymanId })
    await inMemoryOrdersRepository.create(order)

    const result = await sut.execute({
      orderId: order.id.toString(),
      deliverymanId: deliverymanId.toString(),
      deliveryPhotoUrl: 'https://example.com/photo.jpg',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(NotAllowedError)
  })

  it('should not deliver when order is assigned to another deliveryman', async () => {
    const deliverymanId = new UniqueEntityId()
    const otherDeliverymanId = new UniqueEntityId()
    const order = makeOrder({
      status: 'pickedUp',
      deliverymanId,
    })
    await inMemoryOrdersRepository.create(order)

    const result = await sut.execute({
      orderId: order.id.toString(),
      deliverymanId: otherDeliverymanId.toString(),
      deliveryPhotoUrl: 'https://example.com/photo.jpg',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(NotAllowedError)
  })
})
