import { Either, left, right } from '@/core/either'
import { InvalidCredentialsError } from './errors/invalid-credentials-error'
import { Injectable } from '@nestjs/common'
import { AdminsRepository } from '../repository/admins-repository'
import { DeliverymenRepository } from '../repository/deliverymen-repository'
import { HashComparer } from '../cryptography/hash-comparer'
import { Encrypter } from '../cryptography/encrypter'

interface AuthenticateUseCaseRequest {
  cpf: string
  password: string
}

type AuthenticateUseCaseResponse = Either<
  InvalidCredentialsError,
  {
    accessToken: string
    userRole: 'ADMIN' | 'DELIVERYMAN'
  }
>

@Injectable()
export class AuthenticateUseCase {
  constructor(
    private adminsRepository: AdminsRepository,
    private deliverymenRepository: DeliverymenRepository,
    private hashComparer: HashComparer,
    private encrypter: Encrypter,
  ) {}

  async execute({
    cpf,
    password,
  }: AuthenticateUseCaseRequest): Promise<AuthenticateUseCaseResponse> {
    const admin = await this.adminsRepository.findByCPF(cpf)
    if (admin) {
      const matches = await this.hashComparer.compare(password, admin.password)
      if (!matches) {
        return left(new InvalidCredentialsError())
      }
      const accessToken = await this.encrypter.encrypt({
        sub: admin.id.toString(),
        userRole: 'ADMIN',
      })
      return right({ accessToken, userRole: 'ADMIN' })
    }

    const deliveryman = await this.deliverymenRepository.findByCPF(cpf)
    if (deliveryman) {
      const matches = await this.hashComparer.compare(
        password,
        deliveryman.password,
      )
      if (!matches) {
        return left(new InvalidCredentialsError())
      }
      const accessToken = await this.encrypter.encrypt({
        sub: deliveryman.id.toString(),
        userRole: 'DELIVERYMAN',
      })
      return right({ accessToken, userRole: 'DELIVERYMAN' })
    }

    return left(new InvalidCredentialsError())
  }
}
