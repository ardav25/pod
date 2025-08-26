import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // Create Products
  const tshirt = await prisma.product.create({
    data: {
      name: 'T-shirt Custom',
      description: 'A high-quality custom printed t-shirt.',
    },
  });

  const hat = await prisma.product.create({
    data: {
      name: 'Topi Bordir',
      description: 'A custom embroidered hat.',
    },
  });

  console.log('Created products...');

  // Create Orders and associated WorkOrders
  const order1 = await prisma.order.create({
    data: {
      id: 'ord-12345',
      customer: 'Alice Johnson',
      status: 'Fulfilled',
      total: 22.5,
      workOrders: {
        create: {
          productId: tshirt.id,
          designId: 'des-jkl',
          designPreview: 'https://picsum.photos/seed/design4/100/100',
          quantity: 1,
          size: 'S',
          status: 'Completed',
          subcontract: false,
        },
      },
    },
  });

  const order2 = await prisma.order.create({
    data: {
      id: 'ord-12346',
      customer: 'Bob Williams',
      status: 'Processing',
      total: 45.0,
      workOrders: {
        create: [
          {
            productId: tshirt.id,
            designId: 'des-abc',
            designPreview: 'https://picsum.photos/seed/design1/100/100',
            quantity: 1,
            size: 'L',
            status: 'Needs Production',
            subcontract: false,
          },
          {
            productId: tshirt.id,
            designId: 'des-def',
            designPreview: 'https://picsum.photos/seed/design2/100/100',
            quantity: 1,
            size: 'M',
            status: 'Needs Production',
            subcontract: false,
          },
        ],
      },
    },
  });

  const order3 = await prisma.order.create({
    data: {
      id: 'ord-12347',
      customer: 'Charlie Brown',
      status: 'Shipped',
      total: 18.75,
      workOrders: {
        create: {
          productId: tshirt.id,
          designId: 'des-ghi',
          designPreview: 'https://picsum.photos/seed/design3/100/100',
          quantity: 1,
          size: 'XL',
          status: 'In Progress',
          subcontract: false,
        },
      },
    },
  });
  
  const order4 = await prisma.order.create({
    data: {
      id: 'ord-12348',
      customer: 'Diana Miller',
      status: 'Canceled',
      total: 50.2,
       workOrders: {
        create: {
            productId: tshirt.id,
            designId: "des-mno",
            designPreview: "https://picsum.photos/seed/design5/100/100",
            quantity: 2,
            size: "XXL",
            status: "Canceled",
            subcontract: false,
        }
      }
    },
  });

  const order5 = await prisma.order.create({
    data: {
        id: 'ord-12349',
        customer: 'Eve Davis',
        status: 'Processing',
        total: 75.0,
        workOrders: {
            create: {
                productId: hat.id,
                designId: "des-hat1",
                designPreview: "https://picsum.photos/seed/design7/100/100",
                quantity: 10,
                size: "One Size",
                status: "Needs Production",
                subcontract: true,
            }
        }
    }
  })


  console.log('Created orders with work orders...');
  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });