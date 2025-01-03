import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from 'zod'
import { auth } from "../../middlewares/auth";
import { getUserPermissions } from "../../../utils/get-user-permissions";
import { UnauthorizedError } from "../_errors/unauthorized-error";
import { closeInvoice } from "./utils/credit-card-bills";
import { BadRequestError } from "../_errors/bad-request-error";

export async function closeInvoiceRoute(app: FastifyInstance) {
 app.withTypeProvider<ZodTypeProvider>().register(auth).get('/credit-cards/:id/close-invoice', {
   schema: {
    tags: ['credit-cards'],
    summary: 'Close the invoice for a credit card',
    security: [{ bearerAuth: []}],
    params: z.object({
     id: z.string().uuid(),
    }),
    response: {
     200: z.object({
      id: z.string().uuid(),
      month: z.number(),
      year: z.number(),
      closingDate: z.date(),
      dueDate: z.date(),
      totalAmount: z.number(),
      creditCardId: z.string(),
     }),
   },
   },
 }, async (request, reply) => {

  const userId = await request.getCurrentUserId()
  const role = await request.getUserRole(userId);
  
  const { cannot } = getUserPermissions(userId, role.name)

  if(cannot('update', 'credit_cards')){
   throw new UnauthorizedError('You do not have permission to close the invoice')
  }

  const { id } = request.params

  try {
   const invoice = await closeInvoice(id)
   return reply.status(200).send(invoice)
  } catch (error) {
   throw new BadRequestError()
  }
 
 })
}