import { Deliveryman } from '@/domain/delivery/enterprise/deliveryman'
import { DeliverymanPresenter } from './deliveryman-presenter'

export interface DeliverymenPaginatedResponse {
  deliverymen: ReturnType<typeof DeliverymanPresenter.toHTTP>[]
}

export class DeliverymanWithPaginationPresenter {
  static toHTTP(deliverymen: Deliveryman[]): DeliverymenPaginatedResponse {
    return {
      deliverymen: deliverymen.map(DeliverymanPresenter.toHTTP),
    }
  }
}
