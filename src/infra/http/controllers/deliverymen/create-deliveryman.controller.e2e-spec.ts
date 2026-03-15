import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { AdminFactory } from 'test/factories/make-admin'
import { truncateDatabase } from 'test/setup-e2e'
import { createE2eTestingModule } from 'test/utils/create-e2e-module'
import { getAdminToken } from 'test/utils/e2e-auth-helper'
import { uniqueCpf } from 'test/utils/unique-cpf'

describe('CreateDeliveryman (E2E)', () => {
  let app: INestApplication
  let adminFactory: AdminFactory
  let adminToken: string

  beforeAll(async () => {
    await truncateDatabase()
    const moduleRef = await createE2eTestingModule([AdminFactory])

    app = moduleRef.createNestApplication()
    adminFactory = moduleRef.get(AdminFactory)
    await app.init()
    adminToken = await getAdminToken(app, adminFactory)
  })

  afterAll(async () => {
    await app.close()
  })

  test('[POST] /deliverymen - success', async () => {
    const cpf = uniqueCpf()

    const response = await request(app.getHttpServer())
      .post('/deliverymen')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Deliveryman One',
        cpf,
        password: 'secret123',
      })

    expect(response.statusCode).toBe(201)
    expect(response.body).toMatchObject({
      id: expect.any(String),
      name: 'Deliveryman One',
      cpf,
    })
  })

  test('[POST] /deliverymen - 409 when CPF already exists', async () => {
    await request(app.getHttpServer())
      .post('/deliverymen')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'First',
        cpf: '77766655544',
        password: 'pass123',
      })

    const response = await request(app.getHttpServer())
      .post('/deliverymen')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Second',
        cpf: '77766655544',
        password: 'other456',
      })

    expect(response.statusCode).toBe(409)
  })
})
