import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from 'zod';
import { prisma } from "../../../lib/client";
import { auth } from "../../middlewares/auth";

export async function getFinancialSummary(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().register(auth).get('/transactions/summary', {
    schema: {
      tags: ['transactions'],
      summary: 'Retrieve financial summary including current balance and future obligations',
      security: [{ bearerAuth: [] }],
      response: {
       200: z.object({
        currentBalance: z.number(),
        futureExpenses: z.number(),
        futureIncomes: z.number(),
       })
     },
   },
  }, async (request, reply) => {

   const currentDate = new Date()

   const accountsAggregate = await prisma.account.aggregate({
    _sum: { balance: true },
  });
  const currentBalance = accountsAggregate._sum.balance ?? 0;

  const futureExpensesAggregate = await prisma.transactions.aggregate({
    _sum: { amount: true },
    where: {
      type: 'EXPENSE',
      dueDate: { gt: currentDate },
      paymentDate: null,
    },
  });
  const futureExpenses = futureExpensesAggregate._sum.amount ?? 0;

  const futureIncomeAggregate = await prisma.transactions.aggregate({
    _sum: { amount: true },
    where: {
      type: 'INCOME',
      dueDate: { gt: currentDate },
      paymentDate: null,
    },
  });
  const futureIncomes = futureIncomeAggregate._sum.amount ?? 0;


   return reply.status(200).send({
    currentBalance,
    futureExpenses,
    futureIncomes,
   })

 })
}
