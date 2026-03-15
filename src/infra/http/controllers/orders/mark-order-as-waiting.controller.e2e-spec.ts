import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { AdminFactory } from 'test/factories/make-admin'
import { DeliverymanFactory } from 'test/factories/make-deliveryman'
import { OrderFactory } from 'test/factories/make-order'
import { RecipientFactory } from 'test/factories/make-recipient'
import { truncateDatabase } from 'test/setup-e2e'
import { createE2eTestingModule } from 'test/utils/create-e2e-module'
import { getAdminToken, getDeliverymanToken } from 'test/utils/e2e-auth-helper'

describe('MarkOrderAsWaiting (E2E)', () => {
  let app: INestApplication
  let adminFactory: AdminFactory
  let deliverymanFactory: DeliverymanFactory
  let recipientFactory: RecipientFactory
  let orderFactory: OrderFactory
  let adminToken: string
  let deliverymanToken: string

  beforeAll(async () => {
    await truncateDatabase()
    const moduleRef = await createE2eTestingModule([
      AdminFactory,
      DeliverymanFactory,
      RecipientFactory,
      OrderFactory,
    ])

    app = moduleRef.createNestApplication()
    adminFactory = moduleRef.get(AdminFactory)
    deliverymanFactory = moduleRef.get(DeliverymanFactory)
    recipientFactory = moduleRef.get(RecipientFactory)
    orderFactory = moduleRef.get(OrderFactory)
    await app.init()
    adminToken = await getAdminToken(app, adminFactory)
    deliverymanToken = await getDeliverymanToken(app, deliverymanFactory)
  })

  afterAll(async () => {
    await app.close()
  })

  test('[PATCH] /orders/:id/waiting - success', async () => {
    const recipient = await recipientFactory.makePrismaRecipient({
      cpf: '77778888999',
    })
    const order = await orderFactory.makePrismaOrder({
      recipientId: recipient.id.toString(),
      name: 'Order Waiting',
    })

    const response = await request(app.getHttpServer())
      .patch(`/orders/${order.id.toString()}/waiting`)
      .set('Authorization', `Bearer ${adminToken}`)

    expect(response.statusCode).toBe(200)
    expect(response.body.status).toBe('waiting')
  })

  test('[PATCH] /orders/:id/waiting - 404 when not found', async () => {
    const response = await request(app.getHttpServer())
      .patch('/orders/00000000-0000-0000-0000-000000000000/waiting')
      .set('Authorization', `Bearer ${adminToken}`)

    expect(response.statusCode).toBe(404)
  })

  test('[PATCH] /orders/:id/waiting - 403 for deliverymen', async () => {
    const recipient = await recipientFactory.makePrismaRecipient({
      cpf: '22223333444',
    })
    const order = await orderFactory.makePrismaOrder({
      recipientId: recipient.id.toString(),
      deliverymanId: undefined,
      status: 'waiting',
    })

    const response = await request(app.getHttpServer())
      .patch(`/orders/${order.id.toString()}/waiting`)
      .set('Authorization', `Bearer ${deliverymanToken}`)

    expect(response.statusCode).toBe(403)
  })

  test('[PATCH] /orders/:id/waiting - 403 when order is already delivered', async () => {
    const recipient = await recipientFactory.makePrismaRecipient({
      cpf: '55556666777',
    })
    const order = await orderFactory.makePrismaOrder({
      recipientId: recipient.id.toString(),
      status: 'delivered',
    })

    const response = await request(app.getHttpServer())
      .patch(`/orders/${order.id.toString()}/waiting`)
      .set('Authorization', `Bearer ${adminToken}`)

    expect(response.statusCode).toBe(403)
  })
})
