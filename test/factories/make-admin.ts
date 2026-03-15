import { faker } from '@faker-js/faker'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Admin, AdminProps } from '@/domain/delivery/enterprise/admin'
import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { PrismaUserMapper } from '@/infra/database/prisma/mappers/prisma-user-mapper'
import { uniqueCpf } from 'test/utils/unique-cpf'

export function makeAdmin(
  override: Partial<AdminProps> = {},
  id?: UniqueEntityId,
) {
  return Admin.create(
    {
      name: faker.person.firstName(),
      cpf: faker.string.numeric(11),
      password: faker.internet.password(),
      ...override,
    },
    id,
  )
}

@Injectable()
export class AdminFactory {
  constructor(private prisma: PrismaService) {}

  async makePrismaAdmin(data: Partial<AdminProps> = {}): Promise<Admin> {
    const maxAttempts = 5
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const cpf = data.cpf ?? uniqueCpf()
      const admin = makeAdmin({ ...data, cpf })
      try {
        await this.prisma.user.create({
          data: PrismaUserMapper.toPrisma(admin, 'ADMIN'),
        })
        return admin
      } catch (e: unknown) {
        if (attempt === maxAttempts - 1 || data.cpf) throw e
      }
    }
    throw new Error('makePrismaAdmin: unexpected')
  }
}
