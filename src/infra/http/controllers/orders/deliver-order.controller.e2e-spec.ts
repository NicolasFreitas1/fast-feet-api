import { INestApplication } from '@nestjs/common'
import { hash } from 'bcryptjs'
import request from 'supertest'
import { AdminFactory } from 'test/factories/make-admin'
import { DeliverymanFactory } from 'test/factories/make-deliveryman'
import { OrderFactory } from 'test/factories/make-order'
import { RecipientFactory } from 'test/factories/make-recipient'
import { truncateDatabase } from 'test/setup-e2e'
import { createE2eTestingModule } from 'test/utils/create-e2e-module'
import { getAdminToken } from 'test/utils/e2e-auth-helper'
import { uniqueCpf } from 'test/utils/unique-cpf'

describe('DeliverOrder (E2E)', () => {
  let app: INestApplication
  let adminFactory: AdminFactory
  let deliverymanFactory: DeliverymanFactory
  let recipientFactory: RecipientFactory
  let orderFactory: OrderFactory
  let adminToken: string
  let deliverymanToken: string
  let deliveryman: { id: { toString: () => string } }

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
    const cpf = uniqueCpf()
    const password = 'pass'
    deliveryman = await deliverymanFactory.makePrismaDeliveryman({
      cpf,
      password: await hash(password, 10),
    })
    const tokenRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ cpf, password })
    deliverymanToken = tokenRes.body.accessToken
  })

  afterAll(async () => {
    await app.close()
  })

  test('[PATCH] /orders/:id/deliver - success', async () => {
    const recipient = await recipientFactory.makePrismaRecipient({
      cpf: uniqueCpf(),
    })
    const order = await orderFactory.makePrismaOrder({
      recipientId: recipient.id.toString(),
      deliverymanId: deliveryman.id.toString(),
      status: 'pickedUp',
      name: 'Order to Deliver',
    })

    const response = await request(app.getHttpServer())
      .patch(`/orders/${order.id.toString()}/deliver`)
      .set('Authorization', `Bearer ${deliverymanToken}`)
      .attach('file', Buffer.from('proof'), {
        filename: 'proof.jpg',
        contentType: 'image/jpeg',
      })

    expect(response.statusCode).toBe(200)
    expect(response.body.status).toBe('delivered')
    expect(response.body.deliveryPhotoUrl).toContain('/uploads/')
  })

  test('[PATCH] /orders/:id/deliver - 404 when order not found', async () => {
    const response = await request(app.getHttpServer())
      .patch('/orders/00000000-0000-0000-0000-000000000000/deliver')
      .set('Authorization', `Bearer ${deliverymanToken}`)
      .attach('file', Buffer.from('proof'), {
        filename: 'proof.jpg',
        contentType: 'image/jpeg',
      })

    expect(response.statusCode).toBe(404)
  })

  test('[PATCH] /orders/:id/deliver - 403 for admin users', async () => {
    const recipient = await recipientFactory.makePrismaRecipient({
      cpf: uniqueCpf(),
    })
    const order = await orderFactory.makePrismaOrder({
      recipientId: recipient.id.toString(),
      deliverymanId: deliveryman.id.toString(),
      status: 'pickedUp',
    })

    const response = await request(app.getHttpServer())
      .patch(`/orders/${order.id.toString()}/deliver`)
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('file', Buffer.from('proof'), {
        filename: 'proof.jpg',
        contentType: 'image/jpeg',
      })

    expect(response.statusCode).toBe(403)
  })

  test('[PATCH] /orders/:id/deliver - 415 for invalid proof file type', async () => {
    const recipient = await recipientFactory.makePrismaRecipient({
      cpf: uniqueCpf(),
    })
    const order = await orderFactory.makePrismaOrder({
      recipientId: recipient.id.toString(),
      deliverymanId: deliveryman.id.toString(),
      status: 'pickedUp',
    })

    const response = await request(app.getHttpServer())
      .patch(`/orders/${order.id.toString()}/deliver`)
      .set('Authorization', `Bearer ${deliverymanToken}`)
      .attach('file', Buffer.from('proof'), {
        filename: 'proof.txt',
        contentType: 'text/plain',
      })

    expect(response.statusCode).toBe(415)
  })
})
