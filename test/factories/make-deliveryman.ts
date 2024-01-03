import { faker } from '@faker-js/faker'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import {
  Deliveryman,
  DeliverymanProps,
} from '@/domain/delivery/enterprise/deliveryman'

export function makeDeliveryman(
  override: Partial<DeliverymanProps> = {},
  id?: UniqueEntityId,
) {
  const deliveryman = Deliveryman.create(
    {
      name: faker.person.firstName(),
      cpf: faker.lorem.sentence(14),
      password: faker.internet.password(),
      ...override,
    },
    id,
  )

  return deliveryman
}
