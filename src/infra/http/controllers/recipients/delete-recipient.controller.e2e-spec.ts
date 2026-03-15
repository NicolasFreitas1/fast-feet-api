import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { AdminFactory } from 'test/factories/make-admin'
import { RecipientFactory } from 'test/factories/make-recipient'
import { truncateDatabase } from 'test/setup-e2e'
import { createE2eTestingModule } from 'test/utils/create-e2e-module'
import { getAdminToken } from 'test/utils/e2e-auth-helper'

describe('DeleteRecipient (E2E)', () => {
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

  test('[DELETE] /recipients/:id - success', async () => {
    const token = await getAdminToken(app, adminFactory)
    const recipient = await recipientFactory.makePrismaRecipient({
      cpf: '12312312312',
    })

    const response = await request(app.getHttpServer())
      .delete(`/recipients/${recipient.id.toString()}`)
      .set('Authorization', `Bearer ${token}`)

    expect(response.statusCode).toBe(204)
  })

  test('[DELETE] /recipients/:id - 404 when not found', async () => {
    const token = await getAdminToken(app, adminFactory)

    const response = await request(app.getHttpServer())
      .delete('/recipients/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${token}`)

    expect(response.statusCode).toBe(404)
  })
})
