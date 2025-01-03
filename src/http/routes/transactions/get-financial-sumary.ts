import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from 'zod';
import { prisma } from "../../../lib/prisma";
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

   const [totalIncome, totalExpense] = await prisma.$transaction([
     prisma.transactions.aggregate({
      _sum: { amount: true },
      where: {
       type: 'INCOME',
       paymentDate: { lte: currentDate },
      },
     }),

     prisma.transactions.aggregate({
      _sum: { amount: true },
      where: {
        type: "EXPENSE",
        paymentDate: { lte: currentDate },
      },
     }),
   ])

   const currentBalance = 
     (totalIncome._sum.amount ?? 0) - (totalExpense._sum.amount ?? 0)
  
   const futureExpensesAggregate = await prisma.transactions.aggregate({
    _sum: { amount: true },
    where: {
     type: 'EXPENSE',
     dueDate: { gt: currentDate },
    },
   })

   const futureExpenses = futureExpensesAggregate._sum.amount ?? 0

   const futureIncomeAggregate = await prisma.transactions.aggregate({
    _sum: { amount: true },
    where: { 
     type: 'INCOME',
     dueDate: { gt:currentDate }
    },
   })

   const futureIncomes = futureIncomeAggregate._sum.amount ?? 0

   return reply.status(200).send({
    currentBalance,
    futureExpenses,
    futureIncomes,
   })

 })
}
