import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from 'zod'
import { prisma } from "../../../lib/client";
import { hash } from "bcryptjs";
import { UnauthorizedError } from "../_errors/unauthorized-error";

export async function resetPassword(app: FastifyInstance) {
 app.withTypeProvider<ZodTypeProvider>().post('/password/reset', {
   schema: {
    tags: ['auth'],
    summary: 'Reset user password.',
    body: z.object({
     code: z.string(),
     password: z.string(),
    }),
    response: {
      201: z.null()
    },
   },
 }, async (request, reply) => {

  const { code, password } = request.body

  const tokenFromCode = await prisma.token.findUnique({
    where: { token: code },
    include: { user: true },
  });
  
  if (!tokenFromCode || tokenFromCode.type !== "PASSWORD_RECOVER") {
    throw new UnauthorizedError()
  }
 
  if (new Date() > tokenFromCode.expiresAt) {
    throw new UnauthorizedError('Token expired')
  }
  
  const passwordHash = await hash(password, 6)

  await prisma.$transaction([
   prisma.user.update({
    where: {
     id: tokenFromCode.userId
    },
    data: {
     passwordHash,
    },
   }),

   prisma.token.delete({
    where: {
     id: tokenFromCode.id
    },
   })
  ])

  return reply.status(204).send()
 })
}