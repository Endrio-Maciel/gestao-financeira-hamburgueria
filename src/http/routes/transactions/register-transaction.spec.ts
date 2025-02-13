const prismaMock = {
  transactions: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
};

jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => prismaMock),
  };
});


describe("Create Transaction", () => {
  let userMock: any;
  let accountMock: any;

  const TransactionType = {
    EXPENSE: "EXPENSE",
    INCOME: "INCOME",
    TRANSFER: "TRANSFER",
  };
  

  beforeAll(() => {
    userMock = {
      id: "1",
      name: "Admin User",
      email: "admin@example.com",
      passwordHash: "hashed_password",
      roleId: "admin_role_id",
      role: {
        id: "admin_role_id",
        name: "ADMIN",
      },
    };

    accountMock = {
      id: "1",
      name: "Conta Corrente",
      type: "BANK_ACCOUNT",
      balance: 500.0,
      transactions: [],
    };
    const fixedDate = new Date('2025-02-13T16:13:43.900Z');

    prismaMock.transactions.create.mockResolvedValue({
      id: "1",
      title: "Compra de ingredientes",
      description: "Compra de ingredientes",
      amount: 100,
      type: TransactionType.EXPENSE,
      createdAt: fixedDate,
      updatedAt: fixedDate,
      dueDate: null,
      paymentDate: null,
      isFinalized: false,
      accountId: accountMock.id,
      userId: userMock.id,
      categoryId: "2",
      creditCardId: "1",
      creditCardInvoiceId: null,
    });
    
  });

  it("should be able to create a new transaction", async () => {

    const transactionData = {
      title: "Compra de ingredientes",
      description: "Compra de ingredientes",
      amount: 100,
      type: TransactionType.EXPENSE,
      createdAt: new Date(),
      updatedAt: new Date(),
      dueDate: null,
      paymentDate: null,
      isFinalized: false,
      accountId: accountMock.id,
      userId: userMock.id,
      categoryId: "2",
      creditCardId: "1",
      creditCardInvoiceId: null,
    };

    const transaction = await prismaMock.transactions.create({
      data: transactionData,
    });

    expect(transaction).toMatchObject({
      id: "1",
      title: "Compra de ingredientes",
      description: "Compra de ingredientes",
      amount: 100,
      type: TransactionType.EXPENSE,
      dueDate: null,
      paymentDate: null,
      isFinalized: false,
      accountId: accountMock.id,
      userId: userMock.id,
      categoryId: "2",
      creditCardId: "1",
      creditCardInvoiceId: null,
    });
  });
});
