import { Deliveryman } from '@/domain/delivery/enterprise/deliveryman'

export class DeliverymanPresenter {
  static toHTTP(deliveryman: Deliveryman) {
    return {
      id: deliveryman.id.toString(),
      name: deliveryman.name,
      cpf: deliveryman.cpf,
    }
  }
}
