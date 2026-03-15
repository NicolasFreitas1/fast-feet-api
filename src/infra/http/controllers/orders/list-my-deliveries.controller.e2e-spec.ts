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

describe('ListMyDeliveries (E2E)', () => {
  let app: INestApplication
  let deliverymanFactory: DeliverymanFactory
  let recipientFactory: RecipientFactory
  let orderFactory: OrderFactory
  let adminFactory: AdminFactory
  let deliverymanToken: string
  let adminToken: string
  let deliveryman: { id: { toString: () => string } }

  beforeAll(async () => {
    await truncateDatabase()
    const moduleRef = await createE2eTestingModule([
      DeliverymanFactory,
      RecipientFactory,
      OrderFactory,
      AdminFactory,
    ])

    app = moduleRef.createNestApplication()
    deliverymanFactory = moduleRef.get(DeliverymanFactory)
    recipientFactory = moduleRef.get(RecipientFactory)
    orderFactory = moduleRef.get(OrderFactory)
    adminFactory = moduleRef.get(AdminFactory)
    await app.init()
    deliveryman = await deliverymanFactory.makePrismaDeliveryman({
      cpf: '11122233355',
      password: await hash('mypass', 10),
    })
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ cpf: '11122233355', password: 'mypass' })
    deliverymanToken = loginRes.body.accessToken
    adminToken = await getAdminToken(app, adminFactory, '55667788990', '123456')
  })

  afterAll(async () => {
    await app.close()
  })

  test('[GET] /orders/my-deliveries - success', async () => {
    const recipient = await recipientFactory.makePrismaRecipient({
      cpf: '99998888777',
    })
    await orderFactory.makePrismaOrder({
      recipientId: recipient.id.toString(),
      deliverymanId: deliveryman.id.toString(),
      name: 'My Delivery',
    })

    const response = await request(app.getHttpServer())
      .get('/orders/my-deliveries?page=1&perPage=10')
      .set('Authorization', `Bearer ${deliverymanToken}`)

    expect(response.statusCode).toBe(200)
    expect(response.body.orders).toBeDefined()
    expect(Array.isArray(response.body.orders)).toBe(true)
    expect(response.body.orders.length).toBeGreaterThanOrEqual(1)
  })

  test('[GET] /orders/my-deliveries - 403 when not deliveryman', async () => {
    const response = await request(app.getHttpServer())
      .get('/orders/my-deliveries?page=1&perPage=10')
      .set('Authorization', `Bearer ${adminToken}`)

    expect(response.statusCode).toBe(403)
  })
})
