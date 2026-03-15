import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { AdminFactory } from 'test/factories/make-admin'
import { DeliverymanFactory } from 'test/factories/make-deliveryman'
import { truncateDatabase } from 'test/setup-e2e'
import { createE2eTestingModule } from 'test/utils/create-e2e-module'
import { getAdminToken } from 'test/utils/e2e-auth-helper'

describe('ListDeliverymen (E2E)', () => {
  let app: INestApplication
  let adminFactory: AdminFactory
  let deliverymanFactory: DeliverymanFactory

  beforeAll(async () => {
    await truncateDatabase()
    const moduleRef = await createE2eTestingModule([
      AdminFactory,
      DeliverymanFactory,
    ])

    app = moduleRef.createNestApplication()
    adminFactory = moduleRef.get(AdminFactory)
    deliverymanFactory = moduleRef.get(DeliverymanFactory)
    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  test('[GET] /deliverymen - success with pagination', async () => {
    const token = await getAdminToken(app, adminFactory)
    await deliverymanFactory.makePrismaDeliveryman({
      name: 'D1',
      cpf: '11111111111',
    })
    await deliverymanFactory.makePrismaDeliveryman({
      name: 'D2',
      cpf: '22222222222',
    })

    const response = await request(app.getHttpServer())
      .get('/deliverymen?page=1&perPage=10')
      .set('Authorization', `Bearer ${token}`)

    expect(response.statusCode).toBe(200)
    expect(response.body.deliverymen).toBeDefined()
    expect(Array.isArray(response.body.deliverymen)).toBe(true)
    if (response.body.deliverymen.length > 0) {
      expect(response.body.deliverymen[0]).toMatchObject({
        id: expect.any(String),
        name: expect.any(String),
        cpf: expect.any(String),
      })
    }
  })
})
