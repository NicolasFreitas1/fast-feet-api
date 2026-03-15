import { Injectable } from '@nestjs/common'
import {
  NotificationSender,
  OrderStatusForNotification,
} from '@/domain/delivery/application/notification/notification-sender'

@Injectable()
export class LogNotificationSenderService extends NotificationSender {
  async send(
    recipientId: string,
    orderId: string,
    status: OrderStatusForNotification,
  ): Promise<void> {
    console.log(
      `[Notification] Recipient ${recipientId}: Order ${orderId} status changed to ${status}`,
    )
  }
}
