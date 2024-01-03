import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { makeDeliveryman } from 'test/factories/make-deliveryman'
import { InMemoryDeliverymenRepository } from 'test/repositories/in-memory-deliverymen-repository'

import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { GetDeliverymanByIdUseCase } from './get-deliveryman-by-id'

let iMemoryDeliverymenRepository: InMemoryDeliverymenRepository
let sut: GetDeliverymanByIdUseCase

describe('Get Deliveryman by Id', () => {
  beforeEach(() => {
    iMemoryDeliverymenRepository = new InMemoryDeliverymenRepository()

    sut = new GetDeliverymanByIdUseCase(iMemoryDeliverymenRepository)
  })

  it('should be able to get a Deliveryman by Id', async () => {
    const deliveryman = makeDeliveryman(
      { name: 'example-name' },
      new UniqueEntityId('1'),
    )

    await iMemoryDeliverymenRepository.create(deliveryman)

    const result = await sut.execute({
      deliverymanId: '1',
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.deliveryman).toEqual(
        expect.objectContaining({ name: 'example-name' }),
      )
    }
  })

  it('should be not able to edit a non existent Deliveryman', async () => {
    const result = await sut.execute({
      deliverymanId: 'not-existent-deliveryman',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
