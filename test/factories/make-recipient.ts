import { faker } from '@faker-js/faker'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import {
  Recipient,
  RecipientProps,
} from '@/domain/delivery/enterprise/recipient'

export function makeRecipient(
  override: Partial<RecipientProps> = {},
  id?: UniqueEntityId,
) {
  const recipient = Recipient.create(
    {
      name: faker.person.firstName(),
      address: faker.location.streetAddress(),
      cpf: faker.lorem.sentence(14),
      latitude: faker.location.latitude(),
      longitude: faker.location.longitude(),
      phone: faker.phone.number(),

      ...override,
    },
    id,
  )

  return recipient
}
