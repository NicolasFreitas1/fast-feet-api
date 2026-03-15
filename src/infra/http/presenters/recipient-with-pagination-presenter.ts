import { Recipient } from '@/domain/delivery/enterprise/recipient'
import { RecipientPresenter } from './recipient-presenter'

export interface RecipientsPaginatedResponse {
  recipients: ReturnType<typeof RecipientPresenter.toHTTP>[]
}

export class RecipientWithPaginationPresenter {
  static toHTTP(recipients: Recipient[]): RecipientsPaginatedResponse {
    return {
      recipients: recipients.map(RecipientPresenter.toHTTP),
    }
  }
}
