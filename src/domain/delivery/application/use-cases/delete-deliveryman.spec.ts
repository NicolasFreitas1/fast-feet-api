import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { makeDeliveryman } from 'test/factories/make-deliveryman'
import { InMemoryDeliverymenRepository } from 'test/repositories/in-memory-deliverymen-repository'
import { DeleteDeliverymanUseCase } from './delete-deliveryman'

let inMemoryDeliverymenRepository: InMemoryDeliverymenRepository
let sut: DeleteDeliverymanUseCase

describe('Delete Deliveryman', () => {
  beforeEach(() => {
    inMemoryDeliverymenRepository = new InMemoryDeliverymenRepository()

    sut = new DeleteDeliverymanUseCase(inMemoryDeliverymenRepository)
  })

  it('should be able to delete a Deliveryman', async () => {
    const deliveryman = makeDeliveryman({ name: 'example-name' })

    await inMemoryDeliverymenRepository.create(deliveryman)

    const result = await sut.execute({
      deliverymanId: deliveryman.id.toString(),
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(inMemoryDeliverymenRepository.items).toHaveLength(0)
    }
  })

  it('should be not able to delete a non existent Deliveryman', async () => {
    const result = await sut.execute({
      deliverymanId: 'not-existent-deliveryman',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
