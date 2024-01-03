import { makeDeliveryman } from 'test/factories/make-deliveryman'
import { InMemoryDeliverymenRepository } from 'test/repositories/in-memory-deliverymen-repository'
import { ListDeliverymenUseCase } from './list-deliverymen'

let inMemoryDeliverymenRepository: InMemoryDeliverymenRepository
let sut: ListDeliverymenUseCase

describe('Fetch Recent Deliverymen', () => {
  beforeEach(() => {
    inMemoryDeliverymenRepository = new InMemoryDeliverymenRepository()
    sut = new ListDeliverymenUseCase(inMemoryDeliverymenRepository)
  })

  it('should be able to fetch recent deliverymen', async () => {
    await inMemoryDeliverymenRepository.create(
      makeDeliveryman({
        name: 'test-01',
      }),
    )
    await inMemoryDeliverymenRepository.create(
      makeDeliveryman({
        name: 'test-02',
      }),
    )
    await inMemoryDeliverymenRepository.create(
      makeDeliveryman({
        name: 'test-03',
      }),
    )

    const result = await sut.execute({
      page: 1,
      perPage: 20,
    })

    expect(result.value?.deliverymen).toEqual([
      expect.objectContaining({ name: 'test-01' }),
      expect.objectContaining({ name: 'test-02' }),
      expect.objectContaining({ name: 'test-03' }),
    ])
  })

  it('should be able to fetch paginated recent deliverymen', async () => {
    for (let i = 1; i <= 22; i++) {
      await inMemoryDeliverymenRepository.create(makeDeliveryman())
    }

    const result = await sut.execute({
      page: 2,
      perPage: 20,
    })

    expect(result.value?.deliverymen).toHaveLength(2)
  })
})
