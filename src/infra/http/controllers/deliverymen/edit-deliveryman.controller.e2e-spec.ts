import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { AdminFactory } from 'test/factories/make-admin'
import { DeliverymanFactory } from 'test/factories/make-deliveryman'
import { truncateDatabase } from 'test/setup-e2e'
import { createE2eTestingModule } from 'test/utils/create-e2e-module'
import { getAdminToken } from 'test/utils/e2e-auth-helper'

describe('EditDeliveryman (E2E)', () => {
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

  test('[PUT] /deliverymen/:id - success', async () => {
    const token = await getAdminToken(app, adminFactory)
    const deliveryman = await deliverymanFactory.makePrismaDeliveryman({
      name: 'Before Edit',
      cpf: '44455566677',
    })

    const response = await request(app.getHttpServer())
      .put(`/deliverymen/${deliveryman.id.toString()}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'After Edit' })

    expect(response.statusCode).toBe(200)
    expect(response.body.name).toBe('After Edit')
  })

  test('[PUT] /deliverymen/:id - 404 when not found', async () => {
    const token = await getAdminToken(app, adminFactory)

    const response = await request(app.getHttpServer())
      .put('/deliverymen/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Any' })

    expect(response.statusCode).toBe(404)
  })
})
