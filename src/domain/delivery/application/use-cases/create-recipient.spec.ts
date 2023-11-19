import { InMemoryRecipientRepository } from 'test/repositories/in-memory-recipients-repository'
import { CreateRecipientUseCase } from './create-recipient'
import { makeRecipient } from 'test/factories/make-recipient'
import { RecipientAlreadyExistsError } from './errors/recipient-already-exists-error'

let inMemoryRecipientRepository: InMemoryRecipientRepository
let sut: CreateRecipientUseCase

describe('Create Recipient', () => {
  beforeEach(() => {
    inMemoryRecipientRepository = new InMemoryRecipientRepository()

    sut = new CreateRecipientUseCase(inMemoryRecipientRepository)
  })

  it('should be able to create a Recipient', async () => {
    const result = await sut.execute({
      address: 'example-address',
      cpf: 'example-cpf',
      latitude: 1234567,
      longitude: 1234567,
      name: 'example-name',
      phone: '1-123456',
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(inMemoryRecipientRepository.items[0]).toEqual(
        result.value.recipient,
      )
    }
  })

  it('should be not able to create a Recipient when cpf is already in use', async () => {
    const existentRecipient = makeRecipient({})

    inMemoryRecipientRepository.items.push(existentRecipient)

    const result = await sut.execute({
      address: 'example-address',
      cpf: existentRecipient.cpf,
      latitude: 1234567,
      longitude: 1234567,
      name: 'example-name',
      phone: '1-123456',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(RecipientAlreadyExistsError)
  })
})
