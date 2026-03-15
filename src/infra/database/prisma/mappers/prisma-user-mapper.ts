import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Admin } from '@/domain/delivery/enterprise/admin'
import { Deliveryman } from '@/domain/delivery/enterprise/deliveryman'
import { User as PrismaUser, Prisma } from 'generated/prisma/client'

export class PrismaUserMapper {
  static toDomain(raw: PrismaUser): Admin | Deliveryman {
    if (raw.role === 'ADMIN') {
      return Admin.create(
        {
          name: raw.name,
          cpf: raw.cpf,
          password: raw.password,
        },
        new UniqueEntityId(raw.id),
      )
    }
    return Deliveryman.create(
      {
        name: raw.name,
        cpf: raw.cpf,
        password: raw.password,
      },
      new UniqueEntityId(raw.id),
    )
  }

  static toPrisma(
    user: Admin | Deliveryman,
    role: 'ADMIN' | 'DELIVERYMAN',
  ): Prisma.UserUncheckedCreateInput {
    return {
      id: user.id.toString(),
      name: user.name,
      cpf: user.cpf,
      password: user.password,
      role,
    }
  }
}
