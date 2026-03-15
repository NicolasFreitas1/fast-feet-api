import { Module } from '@nestjs/common'
import { NotificationSender } from '@/domain/delivery/application/notification/notification-sender'
import { LogNotificationSenderService } from './log-notification-sender.service'

@Module({
  providers: [
    LogNotificationSenderService,
    {
      provide: NotificationSender,
      useExisting: LogNotificationSenderService,
    },
  ],
  exports: [NotificationSender],
})
export class NotificationModule {}
