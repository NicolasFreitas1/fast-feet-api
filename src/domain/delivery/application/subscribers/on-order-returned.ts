import { DomainEvents } from '@/core/events/domain-events'
import { EventHandler } from '@/core/events/event-handler'
import { OrderReturnedEvent } from '../../enterprise/events/order-returned-event'
import { NotificationSender } from '../notification/notification-sender'
import { Injectable } from '@nestjs/common'

@Injectable()
export class OnOrderReturned implements EventHandler {
  constructor(private notificationSender: NotificationSender) {
    this.setupSubscriptions()
  }

  setupSubscriptions(): void {
    DomainEvents.register(
      this.sendOrderStatusNotification.bind(this),
      OrderReturnedEvent.name,
    )
  }

  private async sendOrderStatusNotification({
    order,
  }: OrderReturnedEvent): Promise<void> {
    await this.notificationSender.send(
      order.recipientId.toString(),
      order.id.toString(),
      'returned',
    )
  }
}
