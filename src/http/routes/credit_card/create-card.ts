import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from 'zod'
import { prisma } from "../../../lib/prisma";
import { auth } from "../../middlewares/auth";
import { getUserPermissions } from "../../../utils/get-user-permissions";
import { UnauthorizedError } from "../_errors/unauthorized-error";
import { BadRequestError } from "../_errors/bad-request-error";

export async function createCreditCard(app: FastifyInstance) {
 app.withTypeProvider<ZodTypeProvider>().register(auth).post('/credit-cards/register', {
   schema: {
    tags: ['credit-cards'],
    summary: 'Create a new credit card',
    security: [{ bearerAuth: []}],
    body: z.object({
     name: z.string(),
     limit: z.coerce.number().min(0),
     closingDate: z.number().int().min(1).max(31),
     dueDate: z.number().int().min(1).max(31),
     accountId: z.string(),
    }),
    response: {
     201: z.object({
      name: z.string(),
      id: z.string().uuid(),
      limit: z.number(),
      closingDate: z.number().int(),
      dueDate: z.number().int(),
      accountId: z.string(),
      available: z.number(),
      createdAt: z.date(),
      updatedAt: z.date().nullable(),
     })
   },
   },
 }, async (request, reply) => {

  const userId = await request.getCurrentUserId()
  const role = await request.getUserRole(userId);
  
  const { cannot } = getUserPermissions(userId, role.name)

  if(cannot('create', 'credit_cards')){
   throw new UnauthorizedError('You do not have permission to create a credit card')
  }

  const { name, limit, closingDate, dueDate, accountId } = request.body;

  const account = await prisma.account.findUnique({
    where: { id: accountId }
  })

  if(!account) {
    throw new BadRequestError('Account not found.')
  }

  const creditCard = await prisma.creditCard.create({
    data: {
      name,
      limit,
      available: limit,
      closingDate,
      dueDate,
      accountId
    }
  })

  return reply.status(201).send(creditCard)

 })
}