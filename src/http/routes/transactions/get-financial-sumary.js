"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFinancialSummary = getFinancialSummary;
const zod_1 = require("zod");
const prisma_1 = require("../../../lib/prisma");
const auth_1 = require("../../middlewares/auth");
async function getFinancialSummary(app) {
    app.withTypeProvider().register(auth_1.auth).get('/transactions/summary', {
        schema: {
            tags: ['transactions'],
            summary: 'Retrieve financial summary including current balance and future obligations',
            security: [{ bearerAuth: [] }],
            response: {
                200: zod_1.z.object({
                    currentBalance: zod_1.z.number(),
                    futureExpenses: zod_1.z.number(),
                    futureIncomes: zod_1.z.number(),
                })
            },
        },
    }, async (request, reply) => {
        const currentDate = new Date();
        const [totalIncome, totalExpense] = await prisma_1.prisma.$transaction([
            prisma_1.prisma.transactions.aggregate({
                _sum: { amount: true },
                where: {
                    type: 'INCOME',
                    paymentDate: { lte: currentDate },
                },
            }),
            prisma_1.prisma.transactions.aggregate({
                _sum: { amount: true },
                where: {
                    type: "EXPENSE",
                    paymentDate: { lte: currentDate },
                },
            }),
        ]);
        const currentBalance = (totalIncome._sum.amount ?? 0) - (totalExpense._sum.amount ?? 0);
        const futureExpensesAggregate = await prisma_1.prisma.transactions.aggregate({
            _sum: { amount: true },
            where: {
                type: 'EXPENSE',
                dueDate: { gt: currentDate },
            },
        });
        const futureExpenses = futureExpensesAggregate._sum.amount ?? 0;
        const futureIncomeAggregate = await prisma_1.prisma.transactions.aggregate({
            _sum: { amount: true },
            where: {
                type: 'INCOME',
                dueDate: { gt: currentDate }
            },
        });
        const futureIncomes = futureIncomeAggregate._sum.amount ?? 0;
        return reply.status(200).send({
            currentBalance,
            futureExpenses,
            futureIncomes,
        });
    });
}
