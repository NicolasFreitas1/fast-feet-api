import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { AdminFactory } from 'test/factories/make-admin'
import { DeliverymanFactory } from 'test/factories/make-deliveryman'
import { truncateDatabase } from 'test/setup-e2e'
import { createE2eTestingModule } from 'test/utils/create-e2e-module'
import { getAdminToken } from 'test/utils/e2e-auth-helper'

describe('DeleteDeliveryman (E2E)', () => {
  let app: INestApplication
  let adminFactory: AdminFactory
  let deliverymanFactory: DeliverymanFactory
  let adminToken: string

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
    adminToken = await getAdminToken(app, adminFactory)
  })

  afterAll(async () => {
    await app.close()
  })

  test('[DELETE] /deliverymen/:id - success', async () => {
    const deliveryman = await deliverymanFactory.makePrismaDeliveryman({
      cpf: '66677788899',
    })

    const response = await request(app.getHttpServer())
      .delete(`/deliverymen/${deliveryman.id.toString()}`)
      .set('Authorization', `Bearer ${adminToken}`)

    expect(response.statusCode).toBe(204)
  })

  test('[DELETE] /deliverymen/:id - 404 when not found', async () => {
    const response = await request(app.getHttpServer())
      .delete('/deliverymen/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${adminToken}`)

    expect(response.statusCode).toBe(404)
  })
})
