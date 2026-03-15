import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { AdminFactory } from 'test/factories/make-admin'
import { RecipientFactory } from 'test/factories/make-recipient'
import { truncateDatabase } from 'test/setup-e2e'
import { createE2eTestingModule } from 'test/utils/create-e2e-module'
import { getAdminToken } from 'test/utils/e2e-auth-helper'

describe('ListRecipients (E2E)', () => {
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

  test('[GET] /recipients - success with pagination', async () => {
    await recipientFactory.makePrismaRecipient({ name: 'Recipient 1' })
    await recipientFactory.makePrismaRecipient({ name: 'Recipient 2' })

    const response = await request(app.getHttpServer())
      .get('/recipients?page=1&perPage=10')
      .set('Authorization', `Bearer ${adminToken}`)

    expect(response.statusCode).toBe(200)
    expect(response.body.recipients.length).toBeGreaterThanOrEqual(2)
    expect(response.body.recipients[0]).toMatchObject({
      id: expect.any(String),
      name: expect.any(String),
      address: expect.any(String),
      phone: expect.any(String),
      cpf: expect.any(String),
      latitude: expect.any(Number),
      longitude: expect.any(Number),
    })
  })
})
