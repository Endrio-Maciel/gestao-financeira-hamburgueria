import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from 'zod'
import { prisma } from "../../../lib/prisma";
import { auth } from "../../middlewares/auth";
import { getUserPermissions } from "../../../utils/get-user-permissions";
import { UnauthorizedError } from "../_errors/unauthorized-error";

export async function listCreditCards(app: FastifyInstance) {
 app.withTypeProvider<ZodTypeProvider>().register(auth).get('/credit-cards/', {
   schema: {
    tags: ['credit-cards'],
    summary: 'list all credit cards with the option to filter by bank account',
    security: [{ bearerAuth: []}],
    querystring: z.object({
     accountId: z.string().optional(),
    })
   },
 }, async (request, reply) => {

  const userId = await request.getCurrentUserId()
  const role = await request.getUserRole(userId);
  
  const { cannot } = getUserPermissions(userId, role.name)

  if(cannot('get', 'credit_cards')){
   throw new UnauthorizedError('You do not have permission to list credit card')
  }

  const { accountId } = request.query

  const creditCards = await prisma.creditCard.findMany({
   where: {
    ...(accountId ? { accountId } : {} ),
   },
   include: {
    transactions: true,
   }
  })

  const formattedCards = creditCards.map((card) => {
   const usedAmount = card.transactions.reduce((sum, transaction) => {
    if(transaction.type === 'EXPENSE' && transaction.isFinalized) {
     return sum + transaction.amount
    }
    return sum
    }, 0)
  
    return {
     id: card.id,
     name: card.name,
     limit: card.limit,
     usedAmount,
     available: card.limit - usedAmount,
     closingDate: card.closingDate,
     dueDate: card.dueDate,
    }
    
   })

  return reply.status(201).send(formattedCards)
 })
}