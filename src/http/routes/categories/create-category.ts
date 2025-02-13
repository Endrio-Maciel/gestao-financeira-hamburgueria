import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from 'zod'
import { prisma } from "../../../lib/client";
import { auth } from "../../middlewares/auth";
import { getUserPermissions } from "../../../utils/get-user-permissions";
import { UnauthorizedError } from "../_errors/unauthorized-error";
import { BadRequestError } from "../_errors/bad-request-error";

export async function createCategory(app: FastifyInstance) {
 app.withTypeProvider<ZodTypeProvider>().register(auth).post('/categories/register', {
   schema: {
    tags: ['categories'],
    summary: 'Create a new category',
    security: [{ bearerAuth: []}],
    body: z.object({
     name: z.string(),
     description: z.string().optional(),
    }),
    response: {
     201: z.object({
        id: z.string(),
        name: z.string(),
        description: z.string().nullable(),
        createdAt: z.coerce.string(),
        updatedAt: z.coerce.string().nullable(),
     })
   },
   },
 }, async (request, reply) => {

  const userId = await request.getCurrentUserId()
  const role = await request.getUserRole(userId);
  
  const { cannot } = getUserPermissions(userId, role.name)

  if(cannot('create', 'categories')){
   throw new UnauthorizedError('You do not have permission to create a category')
  }

  const { name, description } = request.body;

  const existingCategory = await prisma.category.findUnique({
    where: { name }
  })

  if(existingCategory) {
    throw new BadRequestError('There is already a category with that name.')
  }

  const category = await prisma.category.create({
    data: {
      name,
      description,
    }
  })

    const response = {
      ...category,
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt ? category.updatedAt.toISOString() : null,
    }

  return reply.status(201).send(response)
 })
}