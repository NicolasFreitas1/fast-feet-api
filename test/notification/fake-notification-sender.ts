import {
  NotificationSender,
  OrderStatusForNotification,
} from '@/domain/delivery/application/notification/notification-sender'

export class FakeNotificationSender extends NotificationSender {
  public sent: Array<{
    recipientId: string
    orderId: string
    status: OrderStatusForNotification
  }> = []

  async send(
    recipientId: string,
    orderId: string,
    status: OrderStatusForNotification,
  ): Promise<void> {
    this.sent.push({ recipientId, orderId, status })
  }
}
