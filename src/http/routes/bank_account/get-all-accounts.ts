import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../../../lib/prisma";
import { auth } from "../../middlewares/auth";
import { getUserPermissions } from "../../../utils/get-user-permissions";
import { UnauthorizedError } from "../_errors/unauthorized-error";

export async function getAllAccount(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().register(auth).get('/accounts', {
    schema: {
      tags: ['bank_account'],
      summary: 'Get list of accounts',
      security: [{ bearerAuth: [] }],
      querystring: z.object({
        name: z.string().optional(),
      }),
      response: {
        200: z.object({
          accounts: z.array(
            z.object({
              name: z.string(),
              id: z.string(),
              type: z.enum([
                'CASH', 'BANK_ACCOUNT', 'IFOOD_ACCOUNT', 'INVESTMENT_BOX', 
                'EMERGENCY_RESERVE', 'CREDIT_CARD'
              ]),
              balance: z.number(),
            })
          ),
          total: z.number(),
        }),
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

    const [accounts, total] = await prisma.$transaction([
      prisma.account.findMany({
        where: filter,
        orderBy: { name: "desc" },
        include: { _count: true },
      }),
      prisma.account.count({
        where: filter,
      }),
    ]);

    return reply.send({
      accounts,
      total,
    });
  });
}
