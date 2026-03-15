import { InMemoryAdminsRepository } from 'test/repositories/in-memory-admins-repository'
import { InMemoryDeliverymenRepository } from 'test/repositories/in-memory-deliverymen-repository'
import { FakeHasher } from 'test/cryptography/fake-hasher'
import { ChangeUserPasswordUseCase } from './change-user-password'
import { makeAdmin } from 'test/factories/make-admin'
import { makeDeliveryman } from 'test/factories/make-deliveryman'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'

let inMemoryAdminsRepository: InMemoryAdminsRepository
let inMemoryDeliverymenRepository: InMemoryDeliverymenRepository
let fakeHasher: FakeHasher
let sut: ChangeUserPasswordUseCase

describe('Change User Password', () => {
  beforeEach(() => {
    inMemoryAdminsRepository = new InMemoryAdminsRepository()
    inMemoryDeliverymenRepository = new InMemoryDeliverymenRepository()
    fakeHasher = new FakeHasher()
    sut = new ChangeUserPasswordUseCase(
      inMemoryAdminsRepository,
      inMemoryDeliverymenRepository,
      fakeHasher,
    )
  })

  it('should change admin password', async () => {
    const admin = makeAdmin({ password: 'old-hashed' })
    await inMemoryAdminsRepository.create(admin)

    const result = await sut.execute({
      userId: admin.id.toString(),
      newPassword: 'new-password',
    })

    expect(result.isRight()).toBe(true)
    expect(inMemoryAdminsRepository.items[0].password).toBe(
      'new-password-hashed',
    )
  })

  it('should change deliveryman password', async () => {
    const deliveryman = makeDeliveryman({ password: 'old-hashed' })
    await inMemoryDeliverymenRepository.create(deliveryman)

    const result = await sut.execute({
      userId: deliveryman.id.toString(),
      newPassword: 'new-password',
    })

    expect(result.isRight()).toBe(true)
    expect(inMemoryDeliverymenRepository.items[0].password).toBe(
      'new-password-hashed',
    )
  })

  it('should not change password when user not found', async () => {
    const result = await sut.execute({
      userId: '00000000-0000-0000-0000-000000000000',
      newPassword: 'new-password',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
