import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from 'zod'
import { prisma } from "../../../lib/prisma";
import { auth } from "../../middlewares/auth";
import { getUserPermissions } from "../../../utils/get-user-permissions";
import { UnauthorizedError } from "../_errors/unauthorized-error";
import { BadRequestError } from "../_errors/bad-request-error";

export async function updatedCreditCard(app: FastifyInstance) {
 app.withTypeProvider<ZodTypeProvider>().register(auth).put('/credit-cards/:id', {
   schema: {
    tags: ['credit-cards'],
    summary: 'updated credit card',
    security: [{ bearerAuth: []}],
    body: z.object({
     name: z.string().optional(),
     limit: z.coerce.number().min(0).optional(),
     closingDate: z.number().int().optional(),
     dueDate: z.number().int().optional(),
    }),
    params: z.object({
     id: z.string(),
    }),
    response: {
     201: z.object({
      name: z.string(),
      id: z.string().uuid(),
      limit: z.number(),
      closingDate: z.number().int(),
      dueDate: z.number().int(),
      available: z.number(),
      createdAt: z.date(),
      updatedAt: z.date().nullable(),
      accountId: z.string(),
     })
   },
   },
 }, async (request, reply) => {

  const userId = await request.getCurrentUserId()
  const role = await request.getUserRole(userId);
  
  const { cannot } = getUserPermissions(userId, role.name)

  if(cannot('update', 'credit_cards')){
   throw new UnauthorizedError('You do not have permission to updated a credit card')
  }

  const { id } = request.params
  const updates = request.body;

  const existingCard = await prisma.creditCard.findMany({
   where: { id }
  })
  if(!existingCard){
   throw new BadRequestError('Card not found.')
  }

  const creditCard = await prisma.creditCard.update({
   where: { id }, 
   data: updates,
  })

  return reply.status(201).send(creditCard)

 })
}