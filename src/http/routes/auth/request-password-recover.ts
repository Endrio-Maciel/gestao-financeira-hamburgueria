import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from 'zod'
import { randomUUID } from "node:crypto";
import { prisma } from "../../../lib/client";
import { addHours } from "date-fns";

export async function requestPasswordRecover(app: FastifyInstance) {
 app.withTypeProvider<ZodTypeProvider>().post('/password/recover', {
   schema: {
    tags: ['auth'],
    summary: 'get lost user password',
    body: z.object({
     email: z.string(),
    }),
    response: {
      201: z.object({
       token: z.string(),
      })
    }
   },
 }, async (request, reply) => {

  const { email } = request.body

  const userFromEmail = await prisma.user.findUnique({
  where: { email }
  })

  if(!userFromEmail) {
  return reply.status(201).send()
  }

  await prisma.token.deleteMany({
    where: {
      userId: userFromEmail.id,
      type: "PASSWORD_RECOVER",
    }
  })

  const tokenValue = randomUUID()

  const expiresAt = addHours(new Date(), 1)

  const { token } = await prisma.token.create({
  data: {
    type: "PASSWORD_RECOVER",
    token: tokenValue,
    userId: userFromEmail.id, 
    expiresAt,
  },
  })

  console.log('Recover password token: ', token )

  return reply.status(201).send({ token })
})
}