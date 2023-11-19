import { PaginationParams } from 'src/core/repositories/pagination-params'
import { Recipient } from '../../enterprise/recipient'

export abstract class RecipientsRepository {
  abstract findMany(params: PaginationParams): Promise<Recipient[]>
  abstract findByCPF(cpf: string): Promise<Recipient | null>
  abstract findById(id: string): Promise<Recipient | null>
  abstract create(recipient: Recipient): Promise<void>
  abstract save(recipient: Recipient): Promise<void>
  abstract delete(recipient: Recipient): Promise<void>
}
