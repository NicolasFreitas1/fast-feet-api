export type OrderStatusForNotification =
  | 'waiting'
  | 'pickedUp'
  | 'delivered'
  | 'returned'

export abstract class NotificationSender {
  abstract send(
    recipientId: string,
    orderId: string,
    status: OrderStatusForNotification,
  ): Promise<void>
}
