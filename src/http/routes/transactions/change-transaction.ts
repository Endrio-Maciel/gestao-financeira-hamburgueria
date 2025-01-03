import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from 'zod';
import { prisma } from "../../../lib/prisma";
import { auth } from "../../middlewares/auth";
import { getUserPermissions } from "../../../utils/get-user-permissions";
import { UnauthorizedError } from "../_errors/unauthorized-error";
import { BadRequestError } from "../_errors/bad-request-error";

export async function changeTransaction(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().register(auth).put('/transactions/:id/change', {
    schema: {
      tags: ['transactions'],
      summary: 'Change a transaction',
      security: [{ bearerAuth: [] }],
      params: z.object({
        id: z.string().uuid(),
      }),
      body: z.object({
        type: z.enum(["INCOME", "EXPENSE"]).optional(),
        title: z.string().optional(),
        description: z.string().nullable().optional(),
        amount: z.number().positive().optional(),
        dueDate: z.string().nullable().optional(),
        paymentDate: z.string().nullable().optional(),
        categoryId: z.string().uuid().optional(),
      }),
      response: {
        200: z.object({
          id: z.string(),
          type: z.enum(["INCOME", "EXPENSE"]),
          title: z.string(),
          description: z.string().nullable(),
          amount: z.number(),
          dueDate: z.string().nullable(),
          paymentDate: z.string().nullable(),
          isFinalized: z.boolean(),
          createdAt: z.string(),
          updatedAt: z.string(),
        }),
      },
    },
  }, async (request, reply) => {
   
   const userId = await request.getCurrentUserId()
   const role = await request.getUserRole(userId)

   const { cannot } = getUserPermissions(userId, role.name)

   if(cannot('update', 'transactions')){
    throw new UnauthorizedError('You do not have permission to modify this transaction.')
   }

    const { id } = request.params;
    const { type, title, description, amount, dueDate, paymentDate, categoryId } = request.body;

    const existingTransaction = await prisma.transactions.findUnique({ where: { id }})
    if(!existingTransaction) {
      throw new BadRequestError('Transaction not found.')
    }

    const updateData: Record<string, any> = {};
    if (type) updateData.type = type;
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (amount !== undefined) updateData.amount = amount;
    if (dueDate) updateData.dueDate = new Date(dueDate);
    if (paymentDate) {
      updateData.paymentDate = new Date(paymentDate);
      updateData.isFinalized = true; 
    }
    if(categoryId) {
      updateData.categoyId = categoryId
    }

    const updatedTransaction = await prisma.transactions.update({
      where: { id },
      data: updateData,
    });

    return reply.status(200).send({
      id: updatedTransaction.id,
      type: updatedTransaction.type,
      title: updatedTransaction.title,
      description: updatedTransaction.description,
      amount: updatedTransaction.amount,
      dueDate: updatedTransaction.dueDate
        ? updatedTransaction.dueDate.toISOString()
        : null,
      paymentDate: updatedTransaction.paymentDate
        ? updatedTransaction.paymentDate.toISOString()
        : null,
      isFinalized: updatedTransaction.isFinalized,
      createdAt: updatedTransaction.createdAt.toISOString(),
      updatedAt: updatedTransaction.updatedAt.toISOString(),
    });
  });
}
