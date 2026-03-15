import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { AdminFactory } from 'test/factories/make-admin'
import { OrderFactory } from 'test/factories/make-order'
import { RecipientFactory } from 'test/factories/make-recipient'
import { truncateDatabase } from 'test/setup-e2e'
import { createE2eTestingModule } from 'test/utils/create-e2e-module'
import { getAdminToken } from 'test/utils/e2e-auth-helper'

describe('GetOrderById (E2E)', () => {
  let app: INestApplication
  let adminFactory: AdminFactory
  let recipientFactory: RecipientFactory
  let orderFactory: OrderFactory

  beforeAll(async () => {
    await truncateDatabase()
    const moduleRef = await createE2eTestingModule([
      AdminFactory,
      RecipientFactory,
      OrderFactory,
    ])

    app = moduleRef.createNestApplication()
    adminFactory = moduleRef.get(AdminFactory)
    recipientFactory = moduleRef.get(RecipientFactory)
    orderFactory = moduleRef.get(OrderFactory)
    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  test('[GET] /orders/:id - success as admin', async () => {
    const token = await getAdminToken(app, adminFactory)
    const recipient = await recipientFactory.makePrismaRecipient({
      cpf: '12345123451',
    })
    const order = await orderFactory.makePrismaOrder({
      recipientId: recipient.id.toString(),
      name: 'Order to Get',
    })

    const response = await request(app.getHttpServer())
      .get(`/orders/${order.id.toString()}`)
      .set('Authorization', `Bearer ${token}`)

    expect(response.statusCode).toBe(200)
    expect(response.body).toMatchObject({
      id: order.id.toString(),
      name: 'Order to Get',
      status: 'waiting',
      recipientId: recipient.id.toString(),
    })
  })

  test('[GET] /orders/:id - 404 when not found', async () => {
    const token = await getAdminToken(app, adminFactory)

    const response = await request(app.getHttpServer())
      .get('/orders/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${token}`)

    expect(response.statusCode).toBe(404)
  })
})
