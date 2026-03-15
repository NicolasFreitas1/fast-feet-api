import { INestApplication } from '@nestjs/common'
import { hash } from 'bcryptjs'
import request from 'supertest'
import { AdminFactory } from 'test/factories/make-admin'
import { DeliverymanFactory } from 'test/factories/make-deliveryman'
import { truncateDatabase } from 'test/setup-e2e'
import { createE2eTestingModule } from 'test/utils/create-e2e-module'
import { uniqueCpf } from 'test/utils/unique-cpf'

describe('Authenticate (E2E)', () => {
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

  test('[POST] /auth/login - success with admin', async () => {
    const cpf = uniqueCpf()
    const password = '123456'
    await adminFactory.makePrismaAdmin({
      cpf,
      password: await hash(password, 10),
    })

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ cpf, password })

    expect(response.statusCode).toBe(201)
    expect(response.body).toEqual({
      accessToken: expect.any(String),
      userRole: 'ADMIN',
    })
  })

  test('[POST] /auth/login - success with deliveryman', async () => {
    const cpf = uniqueCpf()
    const password = 'delivery123'
    await deliverymanFactory.makePrismaDeliveryman({
      cpf,
      password: await hash(password, 10),
    })

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ cpf, password })

    expect(response.statusCode).toBe(201)
    expect(response.body).toEqual({
      accessToken: expect.any(String),
      userRole: 'DELIVERYMAN',
    })
  })

  test('[POST] /auth/login - invalid credentials', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        cpf: '00000000000',
        password: 'wrong',
      })

    expect(response.statusCode).toBe(401)
  })

  test('[POST] /auth/login - returns 429 when rate limit is exceeded', async () => {
    const limitedModuleRef = await createE2eTestingModule(
      [AdminFactory, DeliverymanFactory],
      {
        RATE_LIMIT_MAX_REQUESTS: 2,
        RATE_LIMIT_WINDOW_MS: 60000,
      },
    )

    const limitedApp = limitedModuleRef.createNestApplication()
    await limitedApp.init()

    try {
      const httpServer = limitedApp.getHttpServer()

      await request(httpServer).post('/auth/login').send({
        cpf: '00000000000',
        password: 'wrong',
      })

      await request(httpServer).post('/auth/login').send({
        cpf: '00000000000',
        password: 'wrong',
      })

      const response = await request(httpServer).post('/auth/login').send({
        cpf: '00000000000',
        password: 'wrong',
      })

      expect(response.statusCode).toBe(429)
      expect(response.body.message).toBe(
        'Too many requests, please try again later',
      )
    } finally {
      await limitedApp.close()
    }
  })
})
