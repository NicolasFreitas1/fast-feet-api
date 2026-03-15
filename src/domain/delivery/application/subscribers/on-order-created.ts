import { DomainEvents } from '@/core/events/domain-events'
import { EventHandler } from '@/core/events/event-handler'
import { OrderCreatedEvent } from '../../enterprise/events/order-created-event'
import { NotificationSender } from '../notification/notification-sender'
import { Injectable } from '@nestjs/common'

@Injectable()
export class OnOrderCreated implements EventHandler {
  constructor(private notificationSender: NotificationSender) {
    this.setupSubscriptions()
  }

  setupSubscriptions(): void {
    DomainEvents.register(
      this.sendOrderStatusNotification.bind(this),
      OrderCreatedEvent.name,
    )
  }

  private async sendOrderStatusNotification({
    order,
  }: OrderCreatedEvent): Promise<void> {
    await this.notificationSender.send(
      order.recipientId.toString(),
      order.id.toString(),
      'waiting',
    )
  }
}
