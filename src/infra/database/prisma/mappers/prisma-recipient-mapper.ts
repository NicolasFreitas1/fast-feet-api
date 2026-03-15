import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Recipient } from '@/domain/delivery/enterprise/recipient'
import { Recipient as PrismaRecipient, Prisma } from 'generated/prisma/client'

export class PrismaRecipientMapper {
  static toDomain(raw: PrismaRecipient): Recipient {
    return Recipient.create(
      {
        name: raw.name,
        address: raw.address,
        phone: raw.phone,
        cpf: raw.cpf,
        latitude: Number(raw.latitude),
        longitude: Number(raw.longitude),
      },
      new UniqueEntityId(raw.id),
    )
  }

  static toPrisma(recipient: Recipient): Prisma.RecipientUncheckedCreateInput {
    return {
      id: recipient.id.toString(),
      name: recipient.name,
      address: recipient.address,
      phone: recipient.phone,
      cpf: recipient.cpf,
      latitude: recipient.latitude,
      longitude: recipient.longitude,
    }
  }
}
