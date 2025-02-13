import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from 'zod'
import { prisma } from "../../../lib/client";
import { auth } from "../../middlewares/auth";
import { getUserPermissions } from "../../../utils/get-user-permissions";
import { UnauthorizedError } from "../_errors/unauthorized-error";
import { BadRequestError } from "../_errors/bad-request-error";

export async function listInvoices(app: FastifyInstance) {
 app.withTypeProvider<ZodTypeProvider>().register(auth).get('/credit-cards/:id/invoices', {
   schema: {
    tags: ['credit-cards'],
    summary: 'List invoices for a credit card',
    security: [{ bearerAuth: []}],
    params: z.object({
     id: z.string().optional(),
    }),
    querystring: z.object({
     month: z.number().int().min(1).max(12).optional(),
     year: z.number().int().optional(),
   }),
   response: {
    200: z.array(z.object({
     id: z.string().uuid(),
     month: z.number().int(),
     year: z.number().int(),
     totalAmount: z.number(),
     closingDate: z.date(),
     dueDate: z.date(),
     transactions: z.array(z.object({
      id: z.string().uuid(),
      title: z.string(),
      amount: z.number(),
      createdAt: z.date(),
     }))
    }))
   }
   },
 }, async (request, reply) => {

  const userId = await request.getCurrentUserId()
  const role = await request.getUserRole(userId);
  
  const { cannot } = getUserPermissions(userId, role.name)

  if(cannot('get', 'credit_cards')){
   throw new UnauthorizedError('You do not have permission to view invoices')
  }

  const { id } = request.params
  const {month, year } = request.query

  const creditCard = await prisma.creditCard.findUnique({ where: { id }})
  if(!creditCard) {
   throw new BadRequestError('Credit card not found')
  }

  const filters: any = { creditCardId: id }
  if(month !== undefined) filters.month
  if(year !== undefined) filters.year = year

  const invoices = await prisma.creditCardInvoice.findMany({
   where: filters,
   include: {
    transactions: {
     select: {
      id: true,
      title: true,
      amount: true,
      createdAt: true,
     },
    },
   },
  })

  return reply.status(200).send(invoices);

 })
}