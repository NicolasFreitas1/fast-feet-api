import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module'
import { CryptographyModule } from '../cryptography/cryptography.module'
import { DatabaseModule } from '../database/database.module'
import { NotificationModule } from '../notification/notification.module'
import { StorageModule } from '../storage/storage.module'
import { AuthenticateController } from './controllers/auth/authenticate.controller'
import { ChangeUserPasswordController } from './controllers/auth/change-user-password.controller'
import { CreateRecipientController } from './controllers/recipients/create-recipient.controller'
import { DeleteRecipientController } from './controllers/recipients/delete-recipient.controller'
import { EditRecipientController } from './controllers/recipients/edit-recipient.controller'
import { GetRecipientByIdController } from './controllers/recipients/get-recipient-by-id.controller'
import { ListRecipientsController } from './controllers/recipients/list-recipients.controller'
import { CreateDeliverymanController } from './controllers/deliverymen/create-deliveryman.controller'
import { DeleteDeliverymanController } from './controllers/deliverymen/delete-deliveryman.controller'
import { EditDeliverymanController } from './controllers/deliverymen/edit-deliveryman.controller'
import { GetDeliverymanByIdController } from './controllers/deliverymen/get-deliveryman-by-id.controller'
import { ListDeliverymenController } from './controllers/deliverymen/list-deliverymen.controller'
import { CreateOrderController } from './controllers/orders/create-order.controller'
import { DeleteOrderController } from './controllers/orders/delete-order.controller'
import { DeliverOrderController } from './controllers/orders/deliver-order.controller'
import { EditOrderController } from './controllers/orders/edit-order.controller'
import { GetOrderByIdController } from './controllers/orders/get-order-by-id.controller'
import { ListMyDeliveriesController } from './controllers/orders/list-my-deliveries.controller'
import { ListOrdersController } from './controllers/orders/list-orders.controller'
import { ListOrdersNearbyController } from './controllers/orders/list-orders-nearby.controller'
import { MarkOrderAsWaitingController } from './controllers/orders/mark-order-as-waiting.controller'
import { PickUpOrderController } from './controllers/orders/pick-up-order.controller'
import { ReturnOrderController } from './controllers/orders/return-order.controller'
import { AuthenticateUseCase } from '@/domain/delivery/application/use-cases/authenticate'
import { ChangeUserPasswordUseCase } from '@/domain/delivery/application/use-cases/change-user-password'
import { CreateRecipientUseCase } from '@/domain/delivery/application/use-cases/create-recipient'
import { DeleteRecipientUseCase } from '@/domain/delivery/application/use-cases/delete-recipient'
import { EditRecipientUseCase } from '@/domain/delivery/application/use-cases/edit-recipient'
import { GetRecipientByIdUseCase } from '@/domain/delivery/application/use-cases/get-recipient-by-id'
import { ListRecipientsUseCase } from '@/domain/delivery/application/use-cases/list-recipients'
import { CreateDeliverymanUseCase } from '@/domain/delivery/application/use-cases/create-deliveryman'
import { DeleteDeliverymanUseCase } from '@/domain/delivery/application/use-cases/delete-deliveryman'
import { EditDeliverymanUseCase } from '@/domain/delivery/application/use-cases/edit-deliveryman'
import { GetDeliverymanByIdUseCase } from '@/domain/delivery/application/use-cases/get-deliveryman-by-id'
import { ListDeliverymenUseCase } from '@/domain/delivery/application/use-cases/list-deliverymen'
import { CreateOrderUseCase } from '@/domain/delivery/application/use-cases/create-order'
import { DeleteOrderUseCase } from '@/domain/delivery/application/use-cases/delete-order'
import { DeliverOrderUseCase } from '@/domain/delivery/application/use-cases/deliver-order'
import { EditOrderUseCase } from '@/domain/delivery/application/use-cases/edit-order'
import { GetOrderByIdUseCase } from '@/domain/delivery/application/use-cases/get-order-by-id'
import { ListMyDeliveriesUseCase } from '@/domain/delivery/application/use-cases/list-my-deliveries'
import { ListOrdersUseCase } from '@/domain/delivery/application/use-cases/list-orders'
import { ListOrdersNearbyUseCase } from '@/domain/delivery/application/use-cases/list-orders-nearby'
import { MarkOrderAsWaitingUseCase } from '@/domain/delivery/application/use-cases/mark-order-as-waiting'
import { PickUpOrderUseCase } from '@/domain/delivery/application/use-cases/pick-up-order'
import { ReturnOrderUseCase } from '@/domain/delivery/application/use-cases/return-order'
import { UploadProofOfDeliveryUseCase } from '@/domain/delivery/application/use-cases/upload-proof-of-delivery'
import { EventsModule } from '../events/events.module'

@Module({
  imports: [
    DatabaseModule,
    CryptographyModule,
    NotificationModule,
    StorageModule,
    AuthModule,
    EventsModule,
  ],
  controllers: [
    AuthenticateController,
    ChangeUserPasswordController,
    CreateRecipientController,
    ListRecipientsController,
    GetRecipientByIdController,
    EditRecipientController,
    DeleteRecipientController,
    CreateDeliverymanController,
    ListDeliverymenController,
    GetDeliverymanByIdController,
    EditDeliverymanController,
    DeleteDeliverymanController,
    CreateOrderController,
    ListOrdersController,
    ListOrdersNearbyController,
    ListMyDeliveriesController,
    GetOrderByIdController,
    EditOrderController,
    DeleteOrderController,
    MarkOrderAsWaitingController,
    PickUpOrderController,
    DeliverOrderController,
    ReturnOrderController,
  ],
  providers: [
    AuthenticateUseCase,
    ChangeUserPasswordUseCase,
    CreateRecipientUseCase,
    ListRecipientsUseCase,
    GetRecipientByIdUseCase,
    EditRecipientUseCase,
    DeleteRecipientUseCase,
    CreateDeliverymanUseCase,
    ListDeliverymenUseCase,
    GetDeliverymanByIdUseCase,
    EditDeliverymanUseCase,
    DeleteDeliverymanUseCase,
    CreateOrderUseCase,
    ListOrdersUseCase,
    ListOrdersNearbyUseCase,
    ListMyDeliveriesUseCase,
    GetOrderByIdUseCase,
    EditOrderUseCase,
    DeleteOrderUseCase,
    MarkOrderAsWaitingUseCase,
    PickUpOrderUseCase,
    DeliverOrderUseCase,
    ReturnOrderUseCase,
    UploadProofOfDeliveryUseCase,
  ],
})
export class HttpModule {}
