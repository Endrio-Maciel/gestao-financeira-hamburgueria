import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../../../lib/prisma";
import { auth } from "../../middlewares/auth";
import { getUserPermissions } from "../../../utils/get-user-permissions";
import { UnauthorizedError } from "../_errors/unauthorized-error";
import { BadRequestError } from "../_errors/bad-request-error";

export async function deleteAccount(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().register(auth).delete('/account/:id/delete', {
    schema: {
      tags: ['bank_account'],
      summary: 'delete account',
      security: [{ bearerAuth: [] }],
      params: z.object({
       id: z.string()
     }),
      response: {
        204: z.null()
      },
    },
  }, async (request, reply) => {
    const userId = await request.getCurrentUserId();
    const role = await request.getUserRole(userId);

    const { cannot } = getUserPermissions(userId, role.name);

    if (cannot('delete', 'categories')) {
      throw new UnauthorizedError('You do not have permission to delete account');
    }

    const { id } = request.params;

    const accountExisting = await prisma.account.findUnique({
     where: { id }
    })
    
    if(!accountExisting) {
      throw new BadRequestError()
    }

    await prisma.creditCard.deleteMany({
      where: {accountId: id}
    })

    await prisma.account.delete({
     where: {id}
    })
    
    return reply.status(204).send()
  });
}
