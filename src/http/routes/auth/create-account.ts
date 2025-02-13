import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from 'zod'
import { prisma } from "../../../lib/client";
import { BadRequestError } from "../_errors/bad-request-error";
import { hash } from "bcryptjs";
import { RoleType } from "@prisma/client";

export async function createAccount(app: FastifyInstance) {
 app.withTypeProvider<ZodTypeProvider>().post('/users/create', {
   schema: {
    tags: ['auth'],
    summary: 'Create a new account',
    body: z.object({
     name: z.string(),
     email: z.string(),
     password: z.string().min(6)
    }),
    response: {
      201: z.null()
    }

   },
 }, async (request, reply) => {
  const { name, email, password } = request.body

  const userWithSameEmail = await prisma.user.findUnique({
   where: { email }
  })

  if(userWithSameEmail) {
   throw new BadRequestError('User with same e-mail alredy exists.')
  }

  const passwordHash = await hash(password, 6)

  const role = await prisma.role.create({
    data: {
      name: RoleType.MEMBER,
    }
  })


  await prisma.user.create({
   data: {
    name,
    email,
    passwordHash,
    roleId: role.id
    }
   },
  )

  return reply.status(201).send()

 })
}