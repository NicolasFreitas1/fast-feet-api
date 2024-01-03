import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { makeDeliveryman } from 'test/factories/make-deliveryman'
import { InMemoryDeliverymenRepository } from 'test/repositories/in-memory-deliverymen-repository'
import { EditDeliverymanUseCase } from './edit-deliveryman'

let inMemoryDeliverymenRepository: InMemoryDeliverymenRepository
let sut: EditDeliverymanUseCase

describe('Edit Deliveryman', () => {
  beforeEach(() => {
    inMemoryDeliverymenRepository = new InMemoryDeliverymenRepository()

    sut = new EditDeliverymanUseCase(inMemoryDeliverymenRepository)
  })

  it('should be able to edit a Deliveryman', async () => {
    const deliveryman = makeDeliveryman({ name: 'example-name' })

    await inMemoryDeliverymenRepository.create(deliveryman)

    const result = await sut.execute({
      deliverymanId: deliveryman.id.toString(),
      name: 'edited-name',
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(inMemoryDeliverymenRepository.items[0].name).toEqual('edited-name')
    }
  })

  it('should be not able to edit a non existent Deliveryman', async () => {
    const result = await sut.execute({
      deliverymanId: 'not-existent-deliveryman',
      name: 'edited-name',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
