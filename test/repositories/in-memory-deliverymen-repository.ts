import { PaginationParams } from '@/core/repositories/pagination-params'
import { DeliverymenRepository } from '@/domain/delivery/application/repository/deliverymen-repository'
import { Deliveryman } from '@/domain/delivery/enterprise/deliveryman'

export class InMemoryDeliverymenRepository implements DeliverymenRepository {
  public items: Deliveryman[] = []

  async findMany({ page }: PaginationParams) {
    const deliverymen = this.items.slice((page - 1) * 20, page * 20)

    return deliverymen
  }

  async findByCPF(cpf: string) {
    const deliveryman = this.items.find(
      (deliveryman) => deliveryman.cpf === cpf,
    )

    if (!deliveryman) {
      return null
    }

    return deliveryman
  }

  async findById(id: string) {
    const deliveryman = this.items.find(
      (deliveryman) => deliveryman.id.toString() === id,
    )

    if (!deliveryman) {
      return null
    }

    return deliveryman
  }

  async create(deliveryman: Deliveryman) {
    this.items.push(deliveryman)
  }

  async save(deliveryman: Deliveryman) {
    const itemIndex = this.items.findIndex((item) => item.id === deliveryman.id)

    this.items[itemIndex] = deliveryman
  }

  async delete(deliveryman: Deliveryman) {
    const itemIndex = this.items.findIndex((item) => item.id === deliveryman.id)

    this.items.splice(itemIndex, 1)
  }
}
