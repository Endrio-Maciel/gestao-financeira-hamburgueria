import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from 'zod'
import { prisma } from "../../../lib/prisma";
import { auth } from "../../middlewares/auth";
import { getUserPermissions } from "../../../utils/get-user-permissions";
import { UnauthorizedError } from "../_errors/unauthorized-error";
import { BadRequestError } from "../_errors/bad-request-error";

export async function deleteCreditCard(app: FastifyInstance) {
 app.withTypeProvider<ZodTypeProvider>().register(auth).delete('/credit-cards/:id/delete', {
   schema: {
    tags: ['credit-cards'],
    summary: 'Delete credit card',
    security: [{ bearerAuth: []}],
    params: z.object({
     id: z.string(),
    }),
    response: {
     204: z.null()
   },
   },
 }, async (request, reply) => {

  const userId = await request.getCurrentUserId()
  const role = await request.getUserRole(userId);
  
  const { cannot } = getUserPermissions(userId, role.name)

  if(cannot('delete', 'credit_cards')){
   throw new UnauthorizedError('You do not have permission to create a credit card')
  }

  const { id } = request.params

  const cardExisting = await prisma.category.findUnique({
    where: { id }
  })

  if(!cardExisting) {
    throw new BadRequestError('Credit card not found.')
  }

  const transaction = await prisma.transactions.findMany({
   where: {creditCardId: id}
 })

 if(transaction.length > 0) {
   throw new BadRequestError('Cannot delete a credit card with linked transactions')
 }

  await prisma.creditCard.delete({
   where: { id }
  })

  return reply.status(204).send()

 })
}