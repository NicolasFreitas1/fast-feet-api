import { DomainEvents } from '@/core/events/domain-events'
import { EventHandler } from '@/core/events/event-handler'
import { OrderMarkedAsWaitingEvent } from '../../enterprise/events/order-marked-as-waiting-event'
import { NotificationSender } from '../notification/notification-sender'
import { Injectable } from '@nestjs/common'

@Injectable()
export class OnOrderMarkedAsWaiting implements EventHandler {
  constructor(private notificationSender: NotificationSender) {
    this.setupSubscriptions()
  }

  setupSubscriptions(): void {
    DomainEvents.register(
      this.sendOrderStatusNotification.bind(this),
      OrderMarkedAsWaitingEvent.name,
    )
  }

  private async sendOrderStatusNotification({
    order,
  }: OrderMarkedAsWaitingEvent): Promise<void> {
    await this.notificationSender.send(
      order.recipientId.toString(),
      order.id.toString(),
      'waiting',
    )
  }
}
