import { PaginationParams } from 'src/core/repositories/pagination-params'
import { Admin } from '../../enterprise/admin'

export abstract class AdminsRepository {
  abstract findMany(params: PaginationParams): Promise<Admin[]>
  abstract findByCPF(cpf: string): Promise<Admin | null>
  abstract findById(id: string): Promise<Admin | null>
  abstract create(admin: Admin): Promise<void>
  abstract save(admin: Admin): Promise<void>
  abstract delete(admin: Admin): Promise<void>
}
