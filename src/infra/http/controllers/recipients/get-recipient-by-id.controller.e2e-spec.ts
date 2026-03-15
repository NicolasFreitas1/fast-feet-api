import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { AdminFactory } from 'test/factories/make-admin'
import { RecipientFactory } from 'test/factories/make-recipient'
import { truncateDatabase } from 'test/setup-e2e'
import { createE2eTestingModule } from 'test/utils/create-e2e-module'
import { getAdminToken } from 'test/utils/e2e-auth-helper'

describe('GetRecipientById (E2E)', () => {
  let app: INestApplication
  let adminFactory: AdminFactory
  let recipientFactory: RecipientFactory
  let adminToken: string

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
    adminToken = await getAdminToken(app, adminFactory)
  })

  afterAll(async () => {
    await app.close()
  })

  test('[GET] /recipients/:id - success', async () => {
    const recipient = await recipientFactory.makePrismaRecipient({
      name: 'Jane Doe',
      cpf: '55566677788',
    })

    const response = await request(app.getHttpServer())
      .get(`/recipients/${recipient.id.toString()}`)
      .set('Authorization', `Bearer ${adminToken}`)

    expect(response.statusCode).toBe(200)
    expect(response.body).toMatchObject({
      id: recipient.id.toString(),
      name: 'Jane Doe',
      cpf: '55566677788',
    })
  })

  test('[GET] /recipients/:id - 404 when not found', async () => {
    const response = await request(app.getHttpServer())
      .get('/recipients/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${adminToken}`)

    expect(response.statusCode).toBe(404)
  })
})
