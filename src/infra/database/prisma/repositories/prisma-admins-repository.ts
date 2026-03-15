import { AdminsRepository } from '@/domain/delivery/application/repository/admins-repository'
import { Admin } from '@/domain/delivery/enterprise/admin'
import { PaginationParams } from '@/core/repositories/pagination-params'
import { Injectable } from '@nestjs/common'
import { PrismaUserMapper } from '../mappers/prisma-user-mapper'
import { PrismaService } from '../prisma.service'

@Injectable()
export class PrismaAdminsRepository implements AdminsRepository {
  constructor(private prisma: PrismaService) {}

  private readonly role = 'ADMIN' as const

  async findMany({ page, perPage }: PaginationParams): Promise<Admin[]> {
    const users = await this.prisma.user.findMany({
      where: { role: this.role },
      take: perPage,
      skip: (page - 1) * perPage,
      orderBy: { name: 'asc' },
    })
    return users.map((u) => PrismaUserMapper.toDomain(u) as Admin)
  }

  async findByCPF(cpf: string): Promise<Admin | null> {
    const user = await this.prisma.user.findFirst({
      where: { cpf, role: this.role },
    })
    return user ? (PrismaUserMapper.toDomain(user) as Admin) : null
  }

  async findById(id: string): Promise<Admin | null> {
    const user = await this.prisma.user.findFirst({
      where: { id, role: this.role },
    })
    return user ? (PrismaUserMapper.toDomain(user) as Admin) : null
  }

  async create(admin: Admin): Promise<void> {
    await this.prisma.user.create({
      data: PrismaUserMapper.toPrisma(admin, 'ADMIN'),
    })
  }

  async save(admin: Admin): Promise<void> {
    const id = admin.id.toString()
    await this.prisma.user.upsert({
      where: { id },
      create: PrismaUserMapper.toPrisma(admin, 'ADMIN'),
      update: {
        name: admin.name,
        password: admin.password,
      },
    })
  }

  async delete(admin: Admin): Promise<void> {
    await this.prisma.user.delete({
      where: { id: admin.id.toString() },
    })
  }
}
