import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// A sample design data URI (a small transparent PNG)
const sampleDesign = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAAAggpSURBVHic7ZtNboMwEIVfDxMKEBURn+hR/uYtdB3qWHf6GRxRkCgltCS+yOAbgWMEyYEjy97jHSRF+fPnk8/nAQAAAAAAAAAAAAAAAAAAAIBP7j1rC6DxxJd8S//J0+77/gMN8MX+s8xT3Xw375QZxrJbO4iH/dLf/L1v/hHk90hC/lB+n7G3v+T82T4a+P2f6Ld9gBqgDbAAaIAaYAWwAGiAGmAFsABogBpgBbAAmgA1wApgAbQAmgAbYAmwAG2ABsQBaIANsACaQDZAG2ABtAAaYAWwAGiAGmAFsABogBpgBbAAmgA1wApgAbQAmgAbYAmwAG2ABsQBaIANsACaQDZAG2ABtAAaYAWwAGiAGmAFsABogBpgBbAAmgA1wApgAbQAmgAbYAmwAG2ABsQBaIANsACaQDZAG2ABtAAaYAWwAGiAGmAFsABogBpgBbAAmgA1wApgAbQAmgAbYAmwAG2ABsQBaIANsACaQDZAG2ABtAAaYAWwAGiAGmAFsABogBpgBbAAmgA1wApgAbQAmgAbYAmwAG2ABsQBaIANsACaQDZAG2ABtAAaYAWwAGiAGmAFsABogBpgBbAAmgA1wApgAbQAmgAbYAmwAG2ABsQBaIANsACaQDZAG2ABtAAaYAWwAGiAGmAFsABogBpgBbAA+EvwA/wEAAAAASUVORK5CYII='

async function main() {
  console.log(`Start seeding ...`)

  // Clean up existing data
  await prisma.workOrder.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();

  // Create a sample order
  const order1 = await prisma.order.create({
    data: {
      customerName: 'Alice Johnson',
      status: 'Pending',
      total: 36.98,
      items: {
        create: [
          {
            productId: 'tshirt-standard',
            color: 'Black',
            size: 'L',
            quantity: 1,
          },
          {
            productId: 'tshirt-standard',
            color: 'White',
            size: 'M',
            quantity: 1,
          },
        ],
      },
    },
  });

  // Create work orders for the first order
  await prisma.workOrder.create({
    data: {
      orderId: order1.id,
      productName: 'T-Shirt',
      productColor: 'Black',
      productSize: 'L',
      designDataUri: sampleDesign,
      quantity: 1,
      status: 'Needs Production',
      isSubcontract: false,
    },
  });

  await prisma.workOrder.create({
    data: {
      orderId: order1.id,
      productName: 'T-Shirt',
      productColor: 'White',
      productSize: 'M',
      designDataUri: sampleDesign,
      quantity: 1,
      status: 'Needs Production',
      isSubcontract: false,
    },
  });

  // Create a second order which needs subcontracting
  const order2 = await prisma.order.create({
    data: {
      customerName: 'Bob Williams',
      status: 'Pending',
      total: 18.49,
      items: {
        create: {
          productId: 'tshirt-standard',
          color: 'Red',
          size: 'XXL',
          quantity: 1,
        },
      },
    },
  });

  // Create a work order that needs subcontracting
  await prisma.workOrder.create({
    data: {
      orderId: order2.id,
      productName: 'T-Shirt',
      productColor: 'Red',
      productSize: 'XXL',
      designDataUri: sampleDesign,
      quantity: 1,
      status: 'Needs Production',
      isSubcontract: true, // This item will be subcontracted
    },
  });

  console.log(`Seeding finished.`);
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
