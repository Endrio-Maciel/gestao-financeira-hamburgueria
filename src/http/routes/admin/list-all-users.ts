import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from 'zod';
import { prisma } from "../../../lib/prisma"; 
import { UnauthorizedError } from "../_errors/unauthorized-error"; 
import { auth } from "../../middlewares/auth";

export async function listUsers(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get('/users', {
      schema: {
        tags: ['users'],
        summary: 'List all users',
        security: [{ bearerAuth: [] }], 
        response: {
          200: z.object({
            message: z.string(),
            users: z.array(z.object({
              id: z.string(),
              email: z.string(),
              roleId: z.string(),
              name: z.string(),
              createdAt: z.string(), 
            })),
          }),
        },
      },
    }, async (request, reply) => {
      try {
        const userId = await request.getCurrentUserId();
        const role = await request.getUserRole(userId);

        if (role.name !== 'ADMIN') {
          throw new UnauthorizedError('Usuário não autorizado a listar usuários');
        }

        const users = await prisma.user.findMany({
          select: {
            id: true,
            email: true,
            roleId: true,
            name: true,
            createdAt: true,
          },
        });

        const formattedUsers = users.map(user => ({
          ...user,
          createdAt: user.createdAt.toISOString(), 
        }));

        return reply.status(200).send({
          message: 'Usuários listados com sucesso!',
          users: formattedUsers,
        });
      } catch (err) {
        return reply.status(500).send({ message: 'Erro ao listar os usuários.', users: [] });
      }
    });
}
