import { prisma } from "../../../../lib/client";

export async function closeInvoice(creditCardId: string) {
  const creditCard = await prisma.creditCard.findUnique({
    where: { id: creditCardId },
  });

  if (!creditCard) {
    throw new Error("credit card not found.");
  }

  const { closingDate } = creditCard;
  const currentDate = new Date();

  const isBeforeClosing = currentDate.getDate() <= closingDate;
  const invoiceMonth = isBeforeClosing
    ? currentDate.getMonth()
    : currentDate.getMonth() + 1;
  const invoiceYear =
    invoiceMonth === 12 ? currentDate.getFullYear() + 1 : currentDate.getFullYear();

  const closingDateObj = new Date(invoiceYear, invoiceMonth - 1, closingDate);
  const dueDateObj = new Date(closingDateObj);
  dueDateObj.setDate(closingDateObj.getDate() + 10);

  const transactions = await prisma.transactions.findMany({
    where: {
      creditCardId,
      isFinalized: false,
      createdAt: { lte: closingDateObj },
    },
  });

  const totalAmount = transactions.reduce((sum, transaction) => {
    return sum + transaction.amount;
  }, 0);

  const invoice = await prisma.creditCardInvoice.create({
    data: {
      month: invoiceMonth,
      year: invoiceYear,
      closingDate: closingDateObj,
      dueDate: dueDateObj,
      totalAmount,
      creditCardId,
      transactions: {
        connect: transactions.map((transaction) => ({ id: transaction.id })),
      },
    },
  });

  await prisma.transactions.updateMany({
    where: { id: { in: transactions.map((transaction) => transaction.id) } },
    data: { isFinalized: true },
  });

  return invoice;
}
