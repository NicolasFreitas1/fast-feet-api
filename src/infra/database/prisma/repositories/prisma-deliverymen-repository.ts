import { DeliverymenRepository } from '@/domain/delivery/application/repository/deliverymen-repository'
import { Deliveryman } from '@/domain/delivery/enterprise/deliveryman'
import { PaginationParams } from '@/core/repositories/pagination-params'
import { Injectable } from '@nestjs/common'
import { PrismaUserMapper } from '../mappers/prisma-user-mapper'
import { PrismaService } from '../prisma.service'

@Injectable()
export class PrismaDeliverymenRepository implements DeliverymenRepository {
  constructor(private prisma: PrismaService) {}

  private readonly role = 'DELIVERYMAN' as const

  async findMany({ page, perPage }: PaginationParams): Promise<Deliveryman[]> {
    const users = await this.prisma.user.findMany({
      where: { role: this.role },
      take: perPage,
      skip: (page - 1) * perPage,
      orderBy: { name: 'asc' },
    })
    return users.map((u) => PrismaUserMapper.toDomain(u) as Deliveryman)
  }

  async findByCPF(cpf: string): Promise<Deliveryman | null> {
    const user = await this.prisma.user.findFirst({
      where: { cpf, role: this.role },
    })
    return user ? (PrismaUserMapper.toDomain(user) as Deliveryman) : null
  }

  async findById(id: string): Promise<Deliveryman | null> {
    const user = await this.prisma.user.findFirst({
      where: { id, role: this.role },
    })
    return user ? (PrismaUserMapper.toDomain(user) as Deliveryman) : null
  }

  async create(deliveryman: Deliveryman): Promise<void> {
    await this.prisma.user.create({
      data: PrismaUserMapper.toPrisma(deliveryman, 'DELIVERYMAN'),
    })
  }

  async save(deliveryman: Deliveryman): Promise<void> {
    const id = deliveryman.id.toString()
    await this.prisma.user.upsert({
      where: { id },
      create: PrismaUserMapper.toPrisma(deliveryman, 'DELIVERYMAN'),
      update: {
        name: deliveryman.name,
        password: deliveryman.password,
      },
    })
  }

  async delete(deliveryman: Deliveryman): Promise<void> {
    await this.prisma.user.delete({
      where: { id: deliveryman.id.toString() },
    })
  }
}
