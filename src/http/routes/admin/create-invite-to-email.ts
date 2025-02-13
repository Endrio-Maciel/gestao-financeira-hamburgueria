import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from 'zod'
import { prisma } from "../../../lib/client";
import { auth } from "../../middlewares/auth";
import { UnauthorizedError } from "../_errors/unauthorized-error";
import { BadRequestError } from "../_errors/bad-request-error";
import crypto from 'node:crypto';
import { sendInviteEmail } from "./service/mailer";

export async function createInvite(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post('/invite/create', {
      schema: {
        tags: ['invites'],
        summary: 'Create a new invite to email',
        security: [{ bearerAuth: [] }],
        body: z.object({
          email: z.string().email(),
          roleName: z.enum(['ADMIN', 'MEMBER', 'BILLING']).default('MEMBER'),
        }),
        response: {
          204: z.null(),
        },
      },
    }, async (request, reply) => {
      try {
        const userId = await request.getCurrentUserId();
        const role = await request.getUserRole(userId);

        if (role.name !== 'ADMIN') {
          throw new UnauthorizedError('Usuário não autorizado a criar convites');
        }

        const { email, roleName } = request.body;

        const user = await prisma.user.findUnique({
          where: {
            email,
          },
        });

        if (user) {
          throw new BadRequestError('Usuário já cadastrado');
        }

        const token = crypto.randomBytes(32).toString('hex');

        await prisma.invitation.create({
          data: {
            email,
            role: roleName,
            expiresAt : new Date(Date.now() + 24 * 60 * 60 * 1000),
            token,
          },
        });

        await sendInviteEmail(email, token);

        return reply.status(204).send();

      } catch (err) {
        throw new BadRequestError('Erro interno ao processar a transação.')
      }
    })
}
