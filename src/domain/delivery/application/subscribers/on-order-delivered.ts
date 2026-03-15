import { DomainEvents } from '@/core/events/domain-events'
import { EventHandler } from '@/core/events/event-handler'
import { OrderDeliveredEvent } from '../../enterprise/events/order-delivered-event'
import { NotificationSender } from '../notification/notification-sender'
import { Injectable } from '@nestjs/common'

@Injectable()
export class OnOrderDelivered implements EventHandler {
  constructor(private notificationSender: NotificationSender) {
    this.setupSubscriptions()
  }

  setupSubscriptions(): void {
    DomainEvents.register(
      this.sendOrderStatusNotification.bind(this),
      OrderDeliveredEvent.name,
    )
  }

  private async sendOrderStatusNotification({
    order,
  }: OrderDeliveredEvent): Promise<void> {
    await this.notificationSender.send(
      order.recipientId.toString(),
      order.id.toString(),
      'delivered',
    )
  }
}
