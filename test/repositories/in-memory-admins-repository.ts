import { PaginationParams } from '@/core/repositories/pagination-params'
import { AdminsRepository } from '@/domain/delivery/application/repository/admins-repository'
import { Admin } from '@/domain/delivery/enterprise/admin'

export class InMemoryAdminsRepository implements AdminsRepository {
  public items: Admin[] = []

  async findMany({ page, perPage }: PaginationParams): Promise<Admin[]> {
    return this.items.slice((page - 1) * perPage, page * perPage)
  }

  async findByCPF(cpf: string): Promise<Admin | null> {
    return this.items.find((a) => a.cpf === cpf) ?? null
  }

  async findById(id: string): Promise<Admin | null> {
    return this.items.find((a) => a.id.toString() === id) ?? null
  }

  async create(admin: Admin): Promise<void> {
    this.items.push(admin)
  }

  async save(admin: Admin): Promise<void> {
    const index = this.items.findIndex((a) => a.id.equals(admin.id))
    if (index >= 0) this.items[index] = admin
  }

  async delete(admin: Admin): Promise<void> {
    const index = this.items.findIndex((a) => a.id.equals(admin.id))
    if (index >= 0) this.items.splice(index, 1)
  }
}
