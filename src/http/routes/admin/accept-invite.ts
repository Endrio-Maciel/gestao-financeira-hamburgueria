import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from 'zod'
import { prisma } from "../../../lib/client";
import { BadRequestError } from "../_errors/bad-request-error";

export async function acceptInvite(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>()
    .post('/invite/accept', {
      schema: {
        tags: ['invites'],
        summary: 'Accept new invitation',
        security: [{ bearerAuth: [] }],
        body: z.object({
          token: z.string(),
        }),
        response: {
          200: z.object({
            message: z.string(),
            user: z.object({
              id: z.string(), 
              email: z.string(),
              roleId: z.string(), 
            }),
          }),
        },
      },
    }, async (request, reply) => {
      try {
        const { token } = request.body;

      
        const invitation = await prisma.invitation.findUnique({
          where: {
            token,
          },
        });

        if (!invitation) {
          throw new BadRequestError('Convite não encontrado');
        }

       
        if (new Date() > invitation.expiresAt) {
          throw new BadRequestError('Convite expirado');
        }

      
        const user = await prisma.user.findUnique({
          where: {
            email: invitation.email,
          },
        });

        
        if (user) {
          throw new BadRequestError('Usuário já existe');
        }

        
        const newUser = await prisma.user.create({
          data: {
            email: invitation.email,
            roleId: invitation.role, 
            passwordHash: '', 
            name: invitation.email, 
            },
         });

        await prisma.invitation.update({
          where: { token },
          data: { acceptedAt: new Date() },
        });

        return reply.status(200).send({
          message: 'Convite aceito com sucesso!',
          user: {
            id: newUser.id,
            email: newUser.email,
            roleId: newUser.roleId,
          },
        });
      } catch (err) {
        throw new BadRequestError('Erro interno ao processar a transação.');
      }
    });
}
