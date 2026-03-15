import { faker } from '@faker-js/faker'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import {
  Recipient,
  RecipientProps,
} from '@/domain/delivery/enterprise/recipient'
import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { PrismaRecipientMapper } from '@/infra/database/prisma/mappers/prisma-recipient-mapper'
import { uniqueCpf } from 'test/utils/unique-cpf'

export function makeRecipient(
  override: Partial<RecipientProps> = {},
  id?: UniqueEntityId,
) {
  const recipient = Recipient.create(
    {
      name: faker.person.firstName(),
      address: faker.location.streetAddress(),
      cpf: faker.string.numeric(11),
      latitude: faker.location.latitude(),
      longitude: faker.location.longitude(),
      phone: faker.string.numeric(10),
      ...override,
    },
    id,
  )

  return recipient
}

@Injectable()
export class RecipientFactory {
  constructor(private prisma: PrismaService) {}

  async makePrismaRecipient(
    data: Partial<RecipientProps> = {},
  ): Promise<Recipient> {
    const maxAttempts = 5
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const cpf = data.cpf ?? uniqueCpf()
      const recipient = makeRecipient({ ...data, cpf })
      try {
        await this.prisma.recipient.create({
          data: PrismaRecipientMapper.toPrisma(recipient),
        })
        return recipient
      } catch (e: unknown) {
        if (attempt === maxAttempts - 1 || data.cpf) throw e
      }
    }
    throw new Error('makePrismaRecipient: unexpected')
  }
}
