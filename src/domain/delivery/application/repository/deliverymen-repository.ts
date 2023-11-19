import { PaginationParams } from 'src/core/repositories/pagination-params'
import { Deliveryman } from '../../enterprise/deliveryman'

export abstract class DeliverymenRepository {
  abstract findMany(params: PaginationParams): Promise<Deliveryman[]>
  abstract findByCPF(cpf: string): Promise<Deliveryman | null>
  abstract findById(id: string): Promise<Deliveryman | null>
  abstract create(deliveryman: Deliveryman): Promise<void>
  abstract save(deliveryman: Deliveryman): Promise<void>
  abstract delete(deliveryman: Deliveryman): Promise<void>
}
