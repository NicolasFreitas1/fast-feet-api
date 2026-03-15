import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { AdminFactory } from 'test/factories/make-admin'
import { OrderFactory } from 'test/factories/make-order'
import { RecipientFactory } from 'test/factories/make-recipient'
import { truncateDatabase } from 'test/setup-e2e'
import { createE2eTestingModule } from 'test/utils/create-e2e-module'
import { getAdminToken } from 'test/utils/e2e-auth-helper'

describe('ListOrders (E2E)', () => {
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

  test('[GET] /orders - success with pagination', async () => {
    const recipient = await recipientFactory.makePrismaRecipient({
      cpf: '12312312399',
    })
    await orderFactory.makePrismaOrder({
      recipientId: recipient.id.toString(),
      name: 'Order A',
    })
    await orderFactory.makePrismaOrder({
      recipientId: recipient.id.toString(),
      name: 'Order B',
    })

    const response = await request(app.getHttpServer())
      .get('/orders?page=1&perPage=10')
      .set('Authorization', `Bearer ${adminToken}`)

    expect(response.statusCode).toBe(200)
    expect(response.body.orders).toBeDefined()
    expect(Array.isArray(response.body.orders)).toBe(true)
    expect(response.body.orders.length).toBeGreaterThanOrEqual(2)
    expect(response.body.orders[0]).toMatchObject({
      id: expect.any(String),
      name: expect.any(String),
      status: expect.any(String),
      recipientId: expect.any(String),
    })
  })
})
