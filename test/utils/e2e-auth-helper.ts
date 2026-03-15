import { INestApplication } from '@nestjs/common'
import { hash } from 'bcryptjs'
import request from 'supertest'
import { AdminFactory } from 'test/factories/make-admin'
import { DeliverymanFactory } from 'test/factories/make-deliveryman'
import { uniqueCpf, isUniqueConstraintError } from 'test/utils/unique-cpf'

export async function getAdminToken(
  app: INestApplication,
  adminFactory: AdminFactory,
  cpf?: string,
  password = '123456',
): Promise<string> {
  const hashed = await hash(password, 10)
  let loginCpf = cpf ?? uniqueCpf()
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      await adminFactory.makePrismaAdmin({ cpf: loginCpf, password: hashed })
      break
    } catch (e: unknown) {
      if (attempt < 2 && !cpf && isUniqueConstraintError(e)) {
        loginCpf = uniqueCpf()
      } else throw e
    }
  }
  const res = await request(app.getHttpServer())
    .post('/auth/login')
    .send({ cpf: loginCpf, password })

  if (res.status !== 201) {
    throw new Error(
      `E2E getAdminToken: login failed with status ${
        res.status
      }. Body: ${JSON.stringify(res.body)}`,
    )
  }
  const token = res.body.accessToken
  if (!token || typeof token !== 'string') {
    throw new Error(
      `E2E getAdminToken: accessToken missing or invalid. Body: ${JSON.stringify(
        res.body,
      )}`,
    )
  }
  return token
}

export async function getDeliverymanToken(
  app: INestApplication,
  deliverymanFactory: DeliverymanFactory,
  cpf?: string,
  password = '123456',
): Promise<string> {
  const hashed = await hash(password, 10)
  let loginCpf = cpf ?? uniqueCpf()
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      await deliverymanFactory.makePrismaDeliveryman({
        cpf: loginCpf,
        password: hashed,
      })
      break
    } catch (e: unknown) {
      if (attempt < 2 && !cpf && isUniqueConstraintError(e)) {
        loginCpf = uniqueCpf()
      } else throw e
    }
  }
  const res = await request(app.getHttpServer())
    .post('/auth/login')
    .send({ cpf: loginCpf, password })

  if (res.status !== 201) {
    throw new Error(
      `E2E getDeliverymanToken: login failed with status ${
        res.status
      }. Body: ${JSON.stringify(res.body)}`,
    )
  }
  const token = res.body.accessToken
  if (!token || typeof token !== 'string') {
    throw new Error(
      `E2E getDeliverymanToken: accessToken missing or invalid. Body: ${JSON.stringify(
        res.body,
      )}`,
    )
  }
  return token
}
