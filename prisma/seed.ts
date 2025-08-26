import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  await prisma.order.deleteMany({})

  await prisma.order.create({
    data: {
      customer: 'Alice Johnson',
      status: 'Fulfilled',
      total: 22.5,
    },
  })

  await prisma.order.create({
    data: {
      customer: 'Bob Williams',
      status: 'Processing',
      total: 45.0,
    },
  })

  await prisma.order.create({
    data: {
      customer: 'Charlie Brown',
      status: 'Shipped',
      total: 18.75,
    },
  })

  await prisma.order.create({
    data: {
      customer: 'Diana Miller',
      status: 'Canceled',
      total: 50.2,
    },
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
