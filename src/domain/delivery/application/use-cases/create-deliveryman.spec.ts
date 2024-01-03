import { makeDeliveryman } from 'test/factories/make-deliveryman'
import { InMemoryDeliverymenRepository } from 'test/repositories/in-memory-deliverymen-repository'
import { CreateDeliverymanUseCase } from './create-deliveryman'
import { DeliverymanAlreadyExistsError } from './errors/deliveryman-already-exists-error'
import { FakeHasher } from 'test/cryptography/fake-hasher'

let inMemoryDeliverymanRepository: InMemoryDeliverymenRepository
let fakeHasher: FakeHasher
let sut: CreateDeliverymanUseCase

describe('Create Deliveryman', () => {
  beforeEach(() => {
    inMemoryDeliverymanRepository = new InMemoryDeliverymenRepository()

    fakeHasher = new FakeHasher()

    sut = new CreateDeliverymanUseCase(
      inMemoryDeliverymanRepository,
      fakeHasher,
    )
  })

  it('should be able to create a Deliveryman', async () => {
    const result = await sut.execute({
      cpf: 'example-cpf',
      name: 'example-name',
      password: 'example-password',
    })

    const hashedPassword = await fakeHasher.hash('example-password')

    expect(result.isRight()).toBe(true)
    expect(inMemoryDeliverymanRepository.items[0].password).toEqual(
      hashedPassword,
    )
    if (result.isRight()) {
      expect(inMemoryDeliverymanRepository.items[0]).toEqual(
        result.value.deliveryman,
      )
    }
  })

  it('should be not able to create a Deliveryman when cpf is already in use', async () => {
    const existentDeliveryman = makeDeliveryman({})

    inMemoryDeliverymanRepository.items.push(existentDeliveryman)

    const result = await sut.execute({
      cpf: existentDeliveryman.cpf,
      name: 'example-name',
      password: 'example-password',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(DeliverymanAlreadyExistsError)
  })
})
