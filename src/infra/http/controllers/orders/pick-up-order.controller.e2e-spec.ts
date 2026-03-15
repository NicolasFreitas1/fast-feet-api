import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { DeliverymanFactory } from 'test/factories/make-deliveryman'
import { OrderFactory } from 'test/factories/make-order'
import { RecipientFactory } from 'test/factories/make-recipient'
import { truncateDatabase } from 'test/setup-e2e'
import { createE2eTestingModule } from 'test/utils/create-e2e-module'
import { getDeliverymanToken } from 'test/utils/e2e-auth-helper'

describe('PickUpOrder (E2E)', () => {
  let app: INestApplication
  let deliverymanFactory: DeliverymanFactory
  let recipientFactory: RecipientFactory
  let orderFactory: OrderFactory
  let deliverymanToken: string

  beforeAll(async () => {
    await truncateDatabase()
    const moduleRef = await createE2eTestingModule([
      DeliverymanFactory,
      RecipientFactory,
      OrderFactory,
    ])

    app = moduleRef.createNestApplication()
    deliverymanFactory = moduleRef.get(DeliverymanFactory)
    recipientFactory = moduleRef.get(RecipientFactory)
    orderFactory = moduleRef.get(OrderFactory)
    await app.init()
    deliverymanToken = await getDeliverymanToken(
      app,
      deliverymanFactory,
      '33344455511',
      '123456',
    )
  })

  afterAll(async () => {
    await app.close()
  })

  test('[PATCH] /orders/:id/pick-up - success', async () => {
    const recipient = await recipientFactory.makePrismaRecipient({
      cpf: '44445555666',
    })
    const order = await orderFactory.makePrismaOrder({
      recipientId: recipient.id.toString(),
      name: 'Order to Pick',
      status: 'waiting',
    })

    const response = await request(app.getHttpServer())
      .patch(`/orders/${order.id.toString()}/pick-up`)
      .set('Authorization', `Bearer ${deliverymanToken}`)

    expect(response.statusCode).toBe(200)
    expect(response.body.status).toBe('pickedUp')
    expect(response.body.deliverymanId).toBeDefined()
  })

  test('[PATCH] /orders/:id/pick-up - 404 when order not found', async () => {
    const response = await request(app.getHttpServer())
      .patch('/orders/00000000-0000-0000-0000-000000000000/pick-up')
      .set('Authorization', `Bearer ${deliverymanToken}`)

    expect(response.statusCode).toBe(404)
  })
})
