import { Module } from '@nestjs/common'
import { PrismaService } from './prisma/prisma.service'
import { EnvService } from '../env/env.service'
import { RecipientsRepository } from '@/domain/delivery/application/repository/recipients-repository'
import { PrismaRecipientsRepository } from './prisma/repositories/prisma-recipients-repository'
import { DeliverymenRepository } from '@/domain/delivery/application/repository/deliverymen-repository'
import { PrismaDeliverymenRepository } from './prisma/repositories/prisma-deliverymen-repository'
import { AdminsRepository } from '@/domain/delivery/application/repository/admins-repository'
import { PrismaAdminsRepository } from './prisma/repositories/prisma-admins-repository'
import { OrdersRepository } from '@/domain/delivery/application/repository/orders-repository'
import { PrismaOrdersRepository } from './prisma/repositories/prisma-orders-repository'
import { CacheModule } from '../cache/cache.module'

@Module({
  imports: [CacheModule],
  providers: [
    PrismaService,
    EnvService,
    {
      provide: RecipientsRepository,
      useClass: PrismaRecipientsRepository,
    },
    {
      provide: DeliverymenRepository,
      useClass: PrismaDeliverymenRepository,
    },
    {
      provide: AdminsRepository,
      useClass: PrismaAdminsRepository,
    },
    {
      provide: OrdersRepository,
      useClass: PrismaOrdersRepository,
    },
  ],
  exports: [
    PrismaService,
    RecipientsRepository,
    DeliverymenRepository,
    AdminsRepository,
    OrdersRepository,
  ],
})
export class DatabaseModule {}
