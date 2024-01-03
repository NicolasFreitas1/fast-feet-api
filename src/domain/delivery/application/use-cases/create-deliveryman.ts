import { Either, left, right } from 'src/core/either'
import { DeliverymanAlreadyExistsError } from './errors/deliveryman-already-exists-error'
import { Deliveryman } from '../../enterprise/deliveryman'
import { Injectable } from '@nestjs/common'
import { DeliverymenRepository } from '../repository/deliverymen-repository'
import { HashGenerator } from '../cryptography/hash-generator'

interface CreateDeliverymanUseCaseRequest {
  name: string
  cpf: string
  password: string
}

type CreateDeliverymanUseCaseResponse = Either<
  DeliverymanAlreadyExistsError,
  {
    deliveryman: Deliveryman
  }
>

@Injectable()
export class CreateDeliverymanUseCase {
  constructor(
    private deliverymenRepository: DeliverymenRepository,
    private hashGenerator: HashGenerator,
  ) {}

  async execute({
    cpf,
    name,
    password,
  }: CreateDeliverymanUseCaseRequest): Promise<CreateDeliverymanUseCaseResponse> {
    const deliverymanExists = await this.deliverymenRepository.findByCPF(cpf)

    if (deliverymanExists) {
      return left(new DeliverymanAlreadyExistsError(cpf))
    }

    const hashedPassword = await this.hashGenerator.hash(password)

    const deliveryman = Deliveryman.create({
      cpf,
      name,
      password: hashedPassword,
    })

    await this.deliverymenRepository.create(deliveryman)

    return right({
      deliveryman,
    })
  }
}
