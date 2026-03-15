import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { AdminFactory } from 'test/factories/make-admin'
import { truncateDatabase } from 'test/setup-e2e'
import { createE2eTestingModule } from 'test/utils/create-e2e-module'
import { getAdminToken } from 'test/utils/e2e-auth-helper'
import { uniqueCpf } from 'test/utils/unique-cpf'

describe('CreateRecipient (E2E)', () => {
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

  test('[POST] /recipients - success', async () => {
    const cpf = uniqueCpf()

    const response = await request(app.getHttpServer())
      .post('/recipients')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'John Doe',
        address: 'Rua Example, 123',
        phone: '1199999999',
        cpf,
        latitude: -23.5505,
        longitude: -46.6333,
      })

    expect(response.statusCode).toBe(201)
    expect(response.body).toMatchObject({
      id: expect.any(String),
      name: 'John Doe',
      address: 'Rua Example, 123',
      phone: '1199999999',
      cpf,
      latitude: -23.5505,
      longitude: -46.6333,
    })
  })

  test('[POST] /recipients - 409 when CPF already exists', async () => {
    await request(app.getHttpServer())
      .post('/recipients')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'First',
        address: 'Addr 1',
        phone: '1188888777',
        cpf: '99988877766',
        latitude: 0,
        longitude: 0,
      })

    const response = await request(app.getHttpServer())
      .post('/recipients')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Second',
        address: 'Addr 2',
        phone: '1177777666',
        cpf: '99988877766',
        latitude: 0,
        longitude: 0,
      })

    expect(response.statusCode).toBe(409)
  })
})
