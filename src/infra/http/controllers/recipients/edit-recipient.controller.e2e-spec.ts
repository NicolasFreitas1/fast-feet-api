import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { AdminFactory } from 'test/factories/make-admin'
import { RecipientFactory } from 'test/factories/make-recipient'
import { truncateDatabase } from 'test/setup-e2e'
import { createE2eTestingModule } from 'test/utils/create-e2e-module'
import { getAdminToken } from 'test/utils/e2e-auth-helper'
import { uniqueCpf } from 'test/utils/unique-cpf'

describe('EditRecipient (E2E)', () => {
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

  test('[PUT] /recipients/:id - success', async () => {
    const recipient = await recipientFactory.makePrismaRecipient({
      name: 'Original Name',
      cpf: uniqueCpf(),
    })

    const response = await request(app.getHttpServer())
      .put(`/recipients/${recipient.id.toString()}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Updated Name' })

    expect(response.statusCode).toBe(200)
    expect(response.body.name).toBe('Updated Name')
  })

  test('[PUT] /recipients/:id - 404 when not found', async () => {
    const response = await request(app.getHttpServer())
      .put('/recipients/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Any' })

    expect(response.statusCode).toBe(404)
  })
})
