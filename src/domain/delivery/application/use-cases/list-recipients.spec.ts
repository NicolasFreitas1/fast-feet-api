import { makeRecipient } from 'test/factories/make-recipient'
import { InMemoryRecipientRepository } from 'test/repositories/in-memory-recipients-repository'
import { ListRecipientsUseCase } from './list-recipients'

let inMemoryRecipientsRepository: InMemoryRecipientRepository
let sut: ListRecipientsUseCase

describe('Fetch Recent Recipients', () => {
  beforeEach(() => {
    inMemoryRecipientsRepository = new InMemoryRecipientRepository()
    sut = new ListRecipientsUseCase(inMemoryRecipientsRepository)
  })

  it('should be able to fetch recent recipients', async () => {
    await inMemoryRecipientsRepository.create(
      makeRecipient({
        name: 'test-01',
      }),
    )
    await inMemoryRecipientsRepository.create(
      makeRecipient({
        name: 'test-02',
      }),
    )
    await inMemoryRecipientsRepository.create(
      makeRecipient({
        name: 'test-03',
      }),
    )

    const result = await sut.execute({
      page: 1,
      perPage: 20,
    })

    expect(result.value?.recipients).toEqual([
      expect.objectContaining({ name: 'test-01' }),
      expect.objectContaining({ name: 'test-02' }),
      expect.objectContaining({ name: 'test-03' }),
    ])
  })

  it('should be able to fetch paginated recent recipients', async () => {
    for (let i = 1; i <= 22; i++) {
      await inMemoryRecipientsRepository.create(makeRecipient())
    }

    const result = await sut.execute({
      page: 2,
      perPage: 20,
    })

    expect(result.value?.recipients).toHaveLength(2)
  })
})
