import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { AdminFactory } from 'test/factories/make-admin'
import { RecipientFactory } from 'test/factories/make-recipient'
import { truncateDatabase } from 'test/setup-e2e'
import { createE2eTestingModule } from 'test/utils/create-e2e-module'
import { getAdminToken } from 'test/utils/e2e-auth-helper'

describe('CreateOrder (E2E)', () => {
  let app: INestApplication
  let adminFactory: AdminFactory
  let recipientFactory: RecipientFactory

  beforeAll(async () => {
    await truncateDatabase()
    const moduleRef = await createE2eTestingModule([
      AdminFactory,
      RecipientFactory,
    ])

    app = moduleRef.createNestApplication()
    adminFactory = moduleRef.get(AdminFactory)
    recipientFactory = moduleRef.get(RecipientFactory)
    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  test('[POST] /orders - success', async () => {
    const token = await getAdminToken(app, adminFactory)
    const recipient = await recipientFactory.makePrismaRecipient({
      cpf: '11122233344',
    })

    const response = await request(app.getHttpServer())
      .post('/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Package 123',
        recipientId: recipient.id.toString(),
      })

    expect(response.statusCode).toBe(201)
    expect(response.body).toMatchObject({
      id: expect.any(String),
      name: 'Package 123',
      status: 'waiting',
      recipientId: recipient.id.toString(),
    })
  })

  test('[POST] /orders - 404 when recipient not found', async () => {
    const token = await getAdminToken(app, adminFactory)

    const response = await request(app.getHttpServer())
      .post('/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Package',
        recipientId: '00000000-0000-0000-0000-000000000000',
      })

    expect(response.statusCode).toBe(404)
  })
})
