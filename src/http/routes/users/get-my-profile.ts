import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from 'zod'
import { prisma } from "../../../lib/client";
import { BadRequestError } from "../_errors/bad-request-error";
import { auth } from "../../middlewares/auth";

export async function getProfile(app: FastifyInstance) {
 app.withTypeProvider<ZodTypeProvider>().register(auth).get('/profile', {
   schema: {
    tags: ['users'],
    summary: 'Get my profile',
    security: [{ bearerAuth: []}],
    response: {
      200: z.object({
       user: z.object({
        id: z.string(),
        name: z.string().nullable(),
        email: z.string().email(),
       })
      })
    },
   },
 }, async (request, reply) => {
  
  const userId = await request.getCurrentUserId()

  const user = await prisma.user.findUnique({
   select: {
    id: true,
    name: true,
    email: true,
   },
   where: {
    id: userId,
   }
  })
  
  if(!user) {
   throw new BadRequestError('User not found.')
  }

  return reply.status(200).send({ user })
 })
}