import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { AdminFactory } from 'test/factories/make-admin'
import { DeliverymanFactory } from 'test/factories/make-deliveryman'
import { truncateDatabase } from 'test/setup-e2e'
import { createE2eTestingModule } from 'test/utils/create-e2e-module'
import { getAdminToken, getDeliverymanToken } from 'test/utils/e2e-auth-helper'

describe('ListOrdersNearby (E2E)', () => {
  let app: INestApplication
  let deliverymanFactory: DeliverymanFactory
  let adminFactory: AdminFactory
  let deliverymanToken: string
  let adminToken: string

  beforeAll(async () => {
    await truncateDatabase()
    const moduleRef = await createE2eTestingModule([
      DeliverymanFactory,
      AdminFactory,
    ])

    app = moduleRef.createNestApplication()
    deliverymanFactory = moduleRef.get(DeliverymanFactory)
    adminFactory = moduleRef.get(AdminFactory)
    await app.init()
    deliverymanToken = await getDeliverymanToken(app, deliverymanFactory)
    adminToken = await getAdminToken(app, adminFactory, '99887766554', '123456')
  })

  afterAll(async () => {
    await app.close()
  })

  test('[GET] /orders/nearby - success', async () => {
    const response = await request(app.getHttpServer())
      .get('/orders/nearby?latitude=-23.55&longitude=-46.63&page=1&perPage=20')
      .set('Authorization', `Bearer ${deliverymanToken}`)

    expect(response.statusCode).toBe(200)
    expect(response.body.orders).toBeDefined()
    expect(Array.isArray(response.body.orders)).toBe(true)
  })

  test('[GET] /orders/nearby - 403 when not deliveryman', async () => {
    const response = await request(app.getHttpServer())
      .get('/orders/nearby?latitude=-23.55&longitude=-46.63')
      .set('Authorization', `Bearer ${adminToken}`)

    expect(response.statusCode).toBe(403)
  })
})
