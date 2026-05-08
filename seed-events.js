require('dotenv/config');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({});

async function main() {
  // Create sample events
  const events = await Promise.all([
    prisma.event.create({
      data: {
        title: 'RBC BROOKLYN HALF',
        description: 'Annual half marathon event',
        location: 'Brooklyn, NY',
        startDate: new Date('2024-06-15T08:00:00Z'),
        endDate: new Date('2024-06-15T12:00:00Z'),
        maxCapacity: 5000,
        isActive: true,
      },
    }),
    prisma.event.create({
      data: {
        title: 'RBC BROOKLYN 10K',
        description: 'Annual 10K event',
        location: 'Brooklyn, NY',
        startDate: new Date('2024-07-20T08:00:00Z'),
        endDate: new Date('2024-07-20T10:00:00Z'),
        maxCapacity: 3000,
        isActive: true,
      },
    }),
  ]);

  console.log('Created events:', events);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
