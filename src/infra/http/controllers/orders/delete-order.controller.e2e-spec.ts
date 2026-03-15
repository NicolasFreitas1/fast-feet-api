import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { AdminFactory } from 'test/factories/make-admin'
import { OrderFactory } from 'test/factories/make-order'
import { RecipientFactory } from 'test/factories/make-recipient'
import { truncateDatabase } from 'test/setup-e2e'
import { createE2eTestingModule } from 'test/utils/create-e2e-module'
import { getAdminToken } from 'test/utils/e2e-auth-helper'

describe('DeleteOrder (E2E)', () => {
  let app: INestApplication
  let adminFactory: AdminFactory
  let recipientFactory: RecipientFactory
  let orderFactory: OrderFactory
  let adminToken: string

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
    adminToken = await getAdminToken(app, adminFactory)
  })

  afterAll(async () => {
    await app.close()
  })

  test('[DELETE] /orders/:id - success', async () => {
    const recipient = await recipientFactory.makePrismaRecipient({
      cpf: '88889999000',
    })
    const order = await orderFactory.makePrismaOrder({
      recipientId: recipient.id.toString(),
    })

    const response = await request(app.getHttpServer())
      .delete(`/orders/${order.id.toString()}`)
      .set('Authorization', `Bearer ${adminToken}`)

    expect(response.statusCode).toBe(204)
  })

  test('[DELETE] /orders/:id - 404 when not found', async () => {
    const response = await request(app.getHttpServer())
      .delete('/orders/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${adminToken}`)

    expect(response.statusCode).toBe(404)
  })
})
