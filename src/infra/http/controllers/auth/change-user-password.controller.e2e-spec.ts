import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { AdminFactory } from 'test/factories/make-admin'
import { DeliverymanFactory } from 'test/factories/make-deliveryman'
import { truncateDatabase } from 'test/setup-e2e'
import { createE2eTestingModule } from 'test/utils/create-e2e-module'
import { getAdminToken } from 'test/utils/e2e-auth-helper'

describe('ChangeUserPassword (E2E)', () => {
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

  test('[PATCH] /auth/users/:userId/password - success', async () => {
    const deliveryman = await deliverymanFactory.makePrismaDeliveryman({
      cpf: '11122233344',
      password: 'oldpass',
    })

    const response = await request(app.getHttpServer())
      .patch(`/auth/users/${deliveryman.id.toString()}/password`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ newPassword: 'newpass123' })

    expect(response.statusCode).toBe(204)
  })

  test('[PATCH] /auth/users/:userId/password - 404 when user not found', async () => {
    const response = await request(app.getHttpServer())
      .patch('/auth/users/00000000-0000-0000-0000-000000000000/password')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ newPassword: 'newpass123' })

    expect(response.statusCode).toBe(404)
  })
})
