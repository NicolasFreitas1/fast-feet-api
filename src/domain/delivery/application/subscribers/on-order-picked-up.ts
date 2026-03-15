import { DomainEvents } from '@/core/events/domain-events'
import { EventHandler } from '@/core/events/event-handler'
import { OrderPickedUpEvent } from '../../enterprise/events/order-picked-up-event'
import { NotificationSender } from '../notification/notification-sender'
import { Injectable } from '@nestjs/common'

@Injectable()
export class OnOrderPickedUp implements EventHandler {
  constructor(private notificationSender: NotificationSender) {
    this.setupSubscriptions()
  }

  setupSubscriptions(): void {
    DomainEvents.register(
      this.sendOrderStatusNotification.bind(this),
      OrderPickedUpEvent.name,
    )
  }

  private async sendOrderStatusNotification({
    order,
  }: OrderPickedUpEvent): Promise<void> {
    await this.notificationSender.send(
      order.recipientId.toString(),
      order.id.toString(),
      'pickedUp',
    )
  }
}
