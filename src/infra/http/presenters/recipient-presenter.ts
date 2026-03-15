import { Recipient } from '@/domain/delivery/enterprise/recipient'

export class RecipientPresenter {
  static toHTTP(recipient: Recipient) {
    return {
      id: recipient.id.toString(),
      name: recipient.name,
      address: recipient.address,
      phone: recipient.phone,
      cpf: recipient.cpf,
      latitude: recipient.latitude,
      longitude: recipient.longitude,
    }
  }
}
