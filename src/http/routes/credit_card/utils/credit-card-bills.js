"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeInvoice = closeInvoice;
const prisma_1 = require("../../../../lib/prisma");
async function closeInvoice(creditCardId) {
    const creditCard = await prisma_1.prisma.creditCard.findUnique({
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
    const invoiceYear = invoiceMonth === 12 ? currentDate.getFullYear() + 1 : currentDate.getFullYear();
    const closingDateObj = new Date(invoiceYear, invoiceMonth - 1, closingDate);
    const dueDateObj = new Date(closingDateObj);
    dueDateObj.setDate(closingDateObj.getDate() + 10);
    const transactions = await prisma_1.prisma.transactions.findMany({
        where: {
            creditCardId,
            isFinalized: false,
            createdAt: { lte: closingDateObj },
        },
    });
    const totalAmount = transactions.reduce((sum, transaction) => {
        return sum + transaction.amount;
    }, 0);
    const invoice = await prisma_1.prisma.creditCardInvoice.create({
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
    await prisma_1.prisma.transactions.updateMany({
        where: { id: { in: transactions.map((transaction) => transaction.id) } },
        data: { isFinalized: true },
    });
    return invoice;
}
