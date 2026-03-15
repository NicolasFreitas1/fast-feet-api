import 'dotenv/config'
import { hash } from 'bcryptjs'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from 'generated/prisma/client'

async function main() {
  const databaseUrl = process.env.DATABASE_URL

  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required to run the demo seed')
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: databaseUrl }),
  })

  try {
    const passwordHash = await hash('123456', 10)

    const admin = await prisma.user.upsert({
      where: { cpf: '11111111111' },
      update: {
        name: 'Admin Demo',
        password: passwordHash,
        role: 'ADMIN',
      },
      create: {
        id: crypto.randomUUID(),
        name: 'Admin Demo',
        cpf: '11111111111',
        password: passwordHash,
        role: 'ADMIN',
      },
    })

    const deliveryman = await prisma.user.upsert({
      where: { cpf: '22222222222' },
      update: {
        name: 'Deliveryman Demo',
        password: passwordHash,
        role: 'DELIVERYMAN',
      },
      create: {
        id: crypto.randomUUID(),
        name: 'Deliveryman Demo',
        cpf: '22222222222',
        password: passwordHash,
        role: 'DELIVERYMAN',
      },
    })

    const recipientA = await prisma.recipient.upsert({
      where: { cpf: '33333333333' },
      update: {
        name: 'Recipient One',
        address: 'Rua das Flores, 100',
        phone: '1199999999',
        latitude: '-23.55052',
        longitude: '-46.633308',
      },
      create: {
        id: crypto.randomUUID(),
        name: 'Recipient One',
        address: 'Rua das Flores, 100',
        phone: '1199999999',
        cpf: '33333333333',
        latitude: '-23.55052',
        longitude: '-46.633308',
      },
    })

    const recipientB = await prisma.recipient.upsert({
      where: { cpf: '44444444444' },
      update: {
        name: 'Recipient Two',
        address: 'Avenida Central, 450',
        phone: '1188888888',
        latitude: '-23.548943',
        longitude: '-46.638818',
      },
      create: {
        id: crypto.randomUUID(),
        name: 'Recipient Two',
        address: 'Avenida Central, 450',
        phone: '1188888888',
        cpf: '44444444444',
        latitude: '-23.548943',
        longitude: '-46.638818',
      },
    })

    await prisma.order.deleteMany({
      where: {
        name: {
          in: [
            'Order Waiting Demo',
            'Order Picked Demo',
            'Order Returned Demo',
          ],
        },
      },
    })

    await prisma.order.createMany({
      data: [
        {
          id: crypto.randomUUID(),
          name: 'Order Waiting Demo',
          status: 'WAITING',
          recipientId: recipientA.id,
        },
        {
          id: crypto.randomUUID(),
          name: 'Order Picked Demo',
          status: 'PICKEDUP',
          recipientId: recipientB.id,
          deliverymanId: deliveryman.id,
          pickedUpAt: new Date(),
        },
        {
          id: crypto.randomUUID(),
          name: 'Order Returned Demo',
          status: 'RETURNED',
          recipientId: recipientA.id,
          deliverymanId: deliveryman.id,
          pickedUpAt: new Date(),
        },
      ],
    })

    console.log(
      JSON.stringify(
        {
          seeded: true,
          adminCpf: admin.cpf,
          deliverymanCpf: deliveryman.cpf,
          password: '123456',
        },
        null,
        2,
      ),
    )
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
