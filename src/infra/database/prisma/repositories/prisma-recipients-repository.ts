import { RecipientsRepository } from '@/domain/delivery/application/repository/recipients-repository'
import { Recipient } from '@/domain/delivery/enterprise/recipient'
import { PaginationParams } from '@/core/repositories/pagination-params'
import { Injectable } from '@nestjs/common'
import { PrismaRecipientMapper } from '../mappers/prisma-recipient-mapper'
import { PrismaService } from '../prisma.service'

@Injectable()
export class PrismaRecipientsRepository implements RecipientsRepository {
  constructor(private prisma: PrismaService) {}

  async findMany({ page, perPage }: PaginationParams): Promise<Recipient[]> {
    const recipients = await this.prisma.recipient.findMany({
      take: perPage,
      skip: (page - 1) * perPage,
      orderBy: { name: 'asc' },
    })
    return recipients.map(PrismaRecipientMapper.toDomain)
  }

  async findByCPF(cpf: string): Promise<Recipient | null> {
    const recipient = await this.prisma.recipient.findUnique({
      where: { cpf },
    })
    return recipient ? PrismaRecipientMapper.toDomain(recipient) : null
  }

  async findById(id: string): Promise<Recipient | null> {
    const recipient = await this.prisma.recipient.findUnique({
      where: { id },
    })
    return recipient ? PrismaRecipientMapper.toDomain(recipient) : null
  }

  async create(recipient: Recipient): Promise<void> {
    await this.prisma.recipient.create({
      data: PrismaRecipientMapper.toPrisma(recipient),
    })
  }

  async save(recipient: Recipient): Promise<void> {
    const id = recipient.id.toString()
    const data = PrismaRecipientMapper.toPrisma(recipient)
    const updateData = { ...data }
    delete updateData.id
    await this.prisma.recipient.upsert({
      where: { id },
      create: data,
      update: updateData,
    })
  }

  async delete(recipient: Recipient): Promise<void> {
    await this.prisma.recipient.delete({
      where: { id: recipient.id.toString() },
    })
  }
}
