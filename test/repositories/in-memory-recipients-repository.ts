import { PaginationParams } from '@/core/repositories/pagination-params'
import { RecipientsRepository } from '@/domain/delivery/application/repository/recipients-repository'
import { Recipient } from '@/domain/delivery/enterprise/recipient'

export class InMemoryRecipientRepository implements RecipientsRepository {
  public items: Recipient[] = []

  async findMany({ page }: PaginationParams) {
    const recipients = this.items.slice((page - 1) * 20, page * 20)

    return recipients
  }

  async findByCPF(cpf: string) {
    const recipient = this.items.find((recipient) => recipient.cpf === cpf)

    if (!recipient) {
      return null
    }

    return recipient
  }

  async findById(id: string) {
    const recipient = this.items.find(
      (recipient) => recipient.id.toString() === id,
    )

    if (!recipient) {
      return null
    }

    return recipient
  }

  async create(recipient: Recipient) {
    this.items.push(recipient)
  }

  async save(recipient: Recipient) {
    const itemIndex = this.items.findIndex((item) => item.id === recipient.id)

    this.items[itemIndex] = recipient
  }

  async delete(recipient: Recipient) {
    const itemIndex = this.items.findIndex((item) => item.id === recipient.id)

    this.items.splice(itemIndex, 1)
  }
}
