import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../../../lib/client";
import { auth } from "../../middlewares/auth";
import { getUserPermissions } from "../../../utils/get-user-permissions";
import { UnauthorizedError } from "../_errors/unauthorized-error";

export async function getAllAccount(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>()
  .register(auth)
  .get('/accounts', {
    schema: {
      tags: ['bank_account'],
      summary: 'Get list of accounts',
      security: [{ bearerAuth: [] }],
      querystring: z.object({
        name: z.string().optional(),
      }),
      response: {
        200: z.array(
          z.object({
            id: z.string(),
            name: z.string(),
            balance: z.number(),
          }),)
        },
      },
   }, async (request, reply) => {
    const userId = await request.getCurrentUserId();
    const role = await request.getUserRole(userId);

    const { cannot } = getUserPermissions(userId, role.name);

    if (cannot('get', 'categories')) {
      throw new UnauthorizedError('You do not have permission to view accounts');
    }

    const { name } = request.query;

    const filter: Record<string, any> = {};

    if (name) {
      filter.name = { contains: name, mode: "insensitive" };
    }

    const accounts = await prisma.account.findMany({
      where: filter,
      orderBy: { name: 'desc'},
      select: {
        id: true,
        name: true,
        balance: true,
      }
    })

    return reply.send( accounts );
  });
}
