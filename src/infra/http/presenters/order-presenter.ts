import { Order } from '@/domain/delivery/enterprise/order'

export class OrderPresenter {
  static toHTTP(order: Order) {
    return {
      id: order.id.toString(),
      name: order.name,
      status: order.status,
      recipientId: order.recipientId.toString(),
      deliverymanId: order.deliverymanId?.toString() ?? null,
      deliveryPhotoUrl: order.deliveryPhotoUrl ?? null,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt ?? null,
      pickedUpAt: order.pickedUpAt ?? null,
      deliveredAt: order.deliveredAt ?? null,
    }
  }
}
