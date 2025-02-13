import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from 'zod';
import { prisma } from "../../../lib/client";
import { auth } from "../../middlewares/auth";
import { getUserPermissions } from "../../../utils/get-user-permissions";
import { UnauthorizedError } from "../_errors/unauthorized-error";
import { BadRequestError } from "../_errors/bad-request-error";

export async function deleteTransaction(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().register(auth).delete('/transactions/:id/delete', {
    schema: {
      tags: ['transactions'],
      summary: 'delete a transaction',
      security: [{ bearerAuth: [] }],
      params: z.object({
        id: z.string(),
      }),
      response: {
        204: z.null()
      },
    },
  }, async (request, reply) => {
   
   const userId = await request.getCurrentUserId()
   const role = await request.getUserRole(userId)

   const { cannot } = getUserPermissions(userId, role.name)

   if(cannot('delete', 'transactions')){
    throw new UnauthorizedError('You do not have permission to modify this transaction.')
   }

   try {
    const { id } = request.params;

    const existingTransaction = await prisma.transactions.findUnique({ where: { id }})
    if(!existingTransaction) {
      console.error(`Transação com ID ${id} dnão encontrada`)
      throw new BadRequestError('Transaction not found.')
    }

    await prisma.transactions.delete({
     where: { id }
    })
    console.log(`Transação com ID ${id} deletada com sucesso`)

    return reply.status(204).send()
   } catch (error) {
      console.error("Erro ao deletar a transação:", error);
      throw new Error("Erro interno ao deletar a transação.");
   }
  })
}
