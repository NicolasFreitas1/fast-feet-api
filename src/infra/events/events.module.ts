import { Module } from '@nestjs/common'
import { NotificationModule } from '../notification/notification.module'
import { OnOrderCreated } from '@/domain/delivery/application/subscribers/on-order-created'
import { OnOrderDelivered } from '@/domain/delivery/application/subscribers/on-order-delivered'
import { OnOrderMarkedAsWaiting } from '@/domain/delivery/application/subscribers/on-order-marked-as-waiting'
import { OnOrderPickedUp } from '@/domain/delivery/application/subscribers/on-order-picked-up'
import { OnOrderReturned } from '@/domain/delivery/application/subscribers/on-order-returned'

@Module({
  imports: [NotificationModule],
  providers: [
    OnOrderCreated,
    OnOrderPickedUp,
    OnOrderDelivered,
    OnOrderReturned,
    OnOrderMarkedAsWaiting,
  ],
})
export class EventsModule {}
