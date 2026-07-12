import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  console.log('Clearing old data...');
  // Delete in reverse order of dependencies
  await prisma.activityLog.deleteMany();
  await prisma.chore.deleteMany();
  await prisma.expenseSplit.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.category.deleteMany();
  await prisma.apartmentMember.deleteMany();
  await prisma.apartment.deleteMany();
  await prisma.user.deleteMany();

  console.log('Creating dummy data...');

  // 1. Users
  const user1 = await prisma.user.create({
    data: {
      clerkUserId: 'user_dummy_1',
      email: 'alice@example.com',
      firstName: 'Alice',
      lastName: 'Smith',
      profileImageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      clerkUserId: 'user_dummy_2',
      email: 'bob@example.com',
      firstName: 'Bob',
      lastName: 'Jones',
      profileImageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
    },
  });

  const user3 = await prisma.user.create({
    data: {
      clerkUserId: 'user_dummy_3',
      email: 'charlie@example.com',
      firstName: 'Charlie',
      lastName: 'Brown',
      profileImageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie',
    },
  });

  // 2. Apartment
  const apartment = await prisma.apartment.create({
    data: {
      name: 'Sunset Boulevard Appt 42',
      description: '123 Sunset Blvd, CA',
    },
  });

  // 3. Memberships
  await prisma.apartmentMember.createMany({
    data: [
      { apartmentId: apartment.id, userId: user1.id, role: 'OWNER' },
      { apartmentId: apartment.id, userId: user2.id, role: 'MEMBER' },
      { apartmentId: apartment.id, userId: user3.id, role: 'MEMBER' },
    ],
  });

  // 4. Categories
  const catGroceries = await prisma.category.create({
    data: { name: 'Groceries', color: '#10b981', apartmentId: apartment.id }
  });
  const catUtilities = await prisma.category.create({
    data: { name: 'Utilities', color: '#3b82f6', apartmentId: apartment.id }
  });
  const catRent = await prisma.category.create({
    data: { name: 'Rent', color: '#f59e0b', apartmentId: apartment.id }
  });
  const catInternet = await prisma.category.create({
    data: { name: 'Internet', color: '#8b5cf6', apartmentId: apartment.id }
  });

  // 5. Expenses & Splits
  const expense1 = await prisma.expense.create({
    data: {
      apartmentId: apartment.id,
      payerId: user1.id,
      categoryId: catRent.id,
      title: 'July Rent',
      amount: 2400.0,
      date: new Date('2026-07-01'),
      splitType: 'EQUAL',
      tags: ['rent', 'monthly'],
      splits: {
        create: [
          { userId: user1.id, amount: 800, isSettled: true },
          { userId: user2.id, amount: 800, isSettled: false },
          { userId: user3.id, amount: 800, isSettled: false },
        ]
      }
    }
  });

  const expense2 = await prisma.expense.create({
    data: {
      apartmentId: apartment.id,
      payerId: user2.id,
      categoryId: catGroceries.id,
      title: 'Trader Joes Haul',
      amount: 150.75,
      date: new Date('2026-07-05'),
      splitType: 'PERCENTAGE',
      tags: ['food'],
      splits: {
        create: [
          { userId: user1.id, amount: 50.25, percentage: 33.33, isSettled: false },
          { userId: user2.id, amount: 50.25, percentage: 33.33, isSettled: true },
          { userId: user3.id, amount: 50.25, percentage: 33.33, isSettled: false },
        ]
      }
    }
  });

  const expense3 = await prisma.expense.create({
    data: {
      apartmentId: apartment.id,
      payerId: user3.id,
      categoryId: catInternet.id,
      title: 'Comcast Bill',
      amount: 90.0,
      date: new Date('2026-07-08'),
      splitType: 'EQUAL',
      isRecurring: true,
      recurringInterval: 'MONTHLY',
      splits: {
        create: [
          { userId: user1.id, amount: 30, isSettled: false },
          { userId: user2.id, amount: 30, isSettled: false },
          { userId: user3.id, amount: 30, isSettled: true },
        ]
      }
    }
  });

  // 6. Chores
  const chore1 = await prisma.chore.create({
    data: {
      apartmentId: apartment.id,
      title: 'Take out the trash',
      description: 'Take recycling and normal trash to the curb',
      assigneeId: user1.id,
      dueDate: new Date('2026-07-15'),
      isCompleted: false,
    }
  });

  const chore2 = await prisma.chore.create({
    data: {
      apartmentId: apartment.id,
      title: 'Clean the kitchen',
      description: 'Wipe counters, mop floor, clean sink',
      assigneeId: user2.id,
      dueDate: new Date('2026-07-16'),
      isCompleted: true,
      completedAt: new Date('2026-07-10'),
    }
  });

  // 7. Activity Logs
  await prisma.activityLog.createMany({
    data: [
      { apartmentId: apartment.id, userId: user1.id, action: 'CREATED_EXPENSE', entityType: 'EXPENSE', entityId: expense1.id, details: { title: 'July Rent' } },
      { apartmentId: apartment.id, userId: user2.id, action: 'CREATED_EXPENSE', entityType: 'EXPENSE', entityId: expense2.id, details: { title: 'Trader Joes Haul' } },
      { apartmentId: apartment.id, userId: user2.id, action: 'COMPLETED_CHORE', entityType: 'CHORE', entityId: chore2.id, details: { title: 'Clean the kitchen' } },
    ]
  });

  console.log('Dummy data inserted successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
