import { InMemoryAdminsRepository } from 'test/repositories/in-memory-admins-repository'
import { InMemoryDeliverymenRepository } from 'test/repositories/in-memory-deliverymen-repository'
import { FakeHasher } from 'test/cryptography/fake-hasher'
import { FakeEncrypter } from 'test/cryptography/fake-encrypter'
import { AuthenticateUseCase } from './authenticate'
import { makeAdmin } from 'test/factories/make-admin'
import { makeDeliveryman } from 'test/factories/make-deliveryman'
import { InvalidCredentialsError } from './errors/invalid-credentials-error'

let inMemoryAdminsRepository: InMemoryAdminsRepository
let inMemoryDeliverymenRepository: InMemoryDeliverymenRepository
let fakeHasher: FakeHasher
let fakeEncrypter: FakeEncrypter
let sut: AuthenticateUseCase

describe('Authenticate', () => {
  beforeEach(() => {
    inMemoryAdminsRepository = new InMemoryAdminsRepository()
    inMemoryDeliverymenRepository = new InMemoryDeliverymenRepository()
    fakeHasher = new FakeHasher()
    fakeEncrypter = new FakeEncrypter()
    sut = new AuthenticateUseCase(
      inMemoryAdminsRepository,
      inMemoryDeliverymenRepository,
      fakeHasher,
      fakeEncrypter,
    )
  })

  it('should authenticate as admin', async () => {
    const admin = makeAdmin({
      cpf: '12345678901',
      password: await fakeHasher.hash('password123'),
    })
    await inMemoryAdminsRepository.create(admin)

    const result = await sut.execute({
      cpf: '12345678901',
      password: 'password123',
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.userRole).toBe('ADMIN')
      expect(result.value.accessToken).toBeDefined()
      expect(JSON.parse(result.value.accessToken).sub).toBe(admin.id.toString())
      expect(JSON.parse(result.value.accessToken).userRole).toBe('ADMIN')
    }
  })

  it('should authenticate as deliveryman', async () => {
    const deliveryman = makeDeliveryman({
      cpf: '98765432100',
      password: await fakeHasher.hash('password456'),
    })
    await inMemoryDeliverymenRepository.create(deliveryman)

    const result = await sut.execute({
      cpf: '98765432100',
      password: 'password456',
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.userRole).toBe('DELIVERYMAN')
      expect(result.value.accessToken).toBeDefined()
    }
  })

  it('should not authenticate with wrong password', async () => {
    const admin = makeAdmin({
      cpf: '12345678901',
      password: await fakeHasher.hash('password123'),
    })
    await inMemoryAdminsRepository.create(admin)

    const result = await sut.execute({
      cpf: '12345678901',
      password: 'wrong-password',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(InvalidCredentialsError)
  })

  it('should not authenticate with non-existent cpf', async () => {
    const result = await sut.execute({
      cpf: '00000000000',
      password: 'password123',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(InvalidCredentialsError)
  })
})
