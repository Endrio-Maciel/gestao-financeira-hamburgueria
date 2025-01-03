import { PrismaClient, RoleType, AccountType, TransactionType } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const roles = [
    { id: "ADMIN", name: RoleType.ADMIN },
    { id: "MEMBER", name: RoleType.MEMBER },
    { id: "BILLING", name: RoleType.BILLING },
  ];
  await prisma.role.createMany({ data: roles, skipDuplicates: true });

  const adminPassword = await hash('admin123', 6);
  const memberPassword = await hash('member123', 6);
  const billingPassword = await hash('billing123', 6);

  await prisma.user.createMany({
    data: [
      { id: "admin", name: "Admin User", email: "admin@example.com", passwordHash: adminPassword, roleId: "ADMIN" },
      { id: "member", name: "Member User", email: "member@example.com", passwordHash: memberPassword, roleId: "MEMBER" },
      { id: "billing", name: "Billing User", email: "billing@example.com", passwordHash: billingPassword, roleId: "BILLING" },
    ],
    skipDuplicates: true,
  });

  const categories = [
    { name: "Food", description: "Food-related expenses" },
    { name: "Beverage", description: "Beverage-related expenses" },
    { name: "Sales", description: "Revenue from sales" },
  ];
  await prisma.category.createMany({ data: categories, skipDuplicates: true });

  const accounts = [
    { id: "cash_account", name: "Cash Account", type: AccountType.CASH, balance: 5000 },
    { id: "bank_account", name: "Bank Account", type: AccountType.BANK_ACCOUNT, balance: 10000 },
  ];
  await prisma.account.createMany({ data: accounts, skipDuplicates: true });

  const creditCards = [
    {
      id: "visa_gold",
      name: "Visa Gold",
      limit: 10000,
      available: 8000,
      closingDate: 15,
      dueDate: 25,
      accountId: "bank_account",
    },
    {
      id: "master_black",
      name: "Master Black",
      limit: 30000,
      available: 25000,
      closingDate: 10,
      dueDate: 20,
      accountId: "bank_account",
    },
  ];
  await prisma.creditCard.createMany({ data: creditCards, skipDuplicates: true });

  const transactions = [
    {
      id: "transaction_1",
      type: TransactionType.EXPENSE,
      title: "Hamburger ingredients",
      description: "Purchased ingredients for hamburgers",
      amount: 500,
      userId: "billing",
      categoryId: (await prisma.category.findFirstOrThrow({ where: { name: "Food" } })).id,
      accountId: "cash_account",
      creditCardId: "visa_gold",
      dueDate: new Date(),
      paymentDate: new Date(),
      isFinalized: true,
    },
    {
      id: "transaction_2",
      type: TransactionType.EXPENSE,
      title: "Beverages stock",
      description: "Purchased beverages for stock",
      amount: 300,
      userId: "billing",
      categoryId: (await prisma.category.findFirstOrThrow({ where: { name: "Beverage" } })).id,
      accountId: "cash_account",
      creditCardId: "master_black",
      dueDate: new Date(),
      paymentDate: new Date(),
      isFinalized: true,
    },
    {
      id: "transaction_3",
      type: TransactionType.INCOME,
      title: "Monthly Revenue",
      description: "Revenue for the month",
      amount: 2000,
      userId: "admin",
      categoryId: (await prisma.category.findFirstOrThrow({ where: { name: "Sales" } })).id,
      accountId: "bank_account",
      isFinalized: true,
    },
  ];
  for (const transaction of transactions) {
    await prisma.transactions.create({ data: transaction });
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {;
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
