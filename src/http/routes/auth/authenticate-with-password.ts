import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from 'zod'
import { prisma } from "../../../lib/client";
import { BadRequestError } from "../_errors/bad-request-error";
import { compare } from "bcryptjs";

export async function authenticateWithPassword(app: FastifyInstance) {
 app.withTypeProvider<ZodTypeProvider>().post('/sessions/password', {
   schema: {
    tags: ['auth'],
    summary: 'Authenticate with e-mail & password',
    body: z.object({
     email: z.string(),
     password: z.string(),
    }),
    response: {
      201: z.object({
       token: z.string(),
      })
    }

   },
 }, async (request, reply) => {

  const { email, password } = request.body

  const userFromEmail = await prisma.user.findUnique({
   where: { email }
  })

  if(!userFromEmail) {
   throw new BadRequestError('Invalid credentials.')
  }

  const isPasswordValid = await compare(password, userFromEmail.passwordHash)

  if(!isPasswordValid) {
   throw new BadRequestError('Invalid credentials.')
  }
 
  const token = await reply.jwtSign(
   {
    sub: userFromEmail.id,
   },
   {
    sign: {
     expiresIn: '7d',
    },
   },
  )

  return reply.status(201).send({ token })
 })
}