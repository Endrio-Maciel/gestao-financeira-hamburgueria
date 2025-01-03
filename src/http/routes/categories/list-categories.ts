import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from 'zod'
import { prisma } from "../../../lib/prisma";
import { auth } from "../../middlewares/auth";
import { getUserPermissions } from "../../../utils/get-user-permissions";
import { UnauthorizedError } from "../_errors/unauthorized-error";

export async function listCategories(app: FastifyInstance) {
 app.withTypeProvider<ZodTypeProvider>().register(auth).get('/categories', {
   schema: {
    tags: ['categories'],
    summary: 'List all categories',
    security: [{ bearerAuth: []}],
    response: {
     200: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        description: z.string().nullable(),
        createdAt: z.coerce.string(),
        updatedAt: z.coerce.string().nullable(),
     }) 
     )
   },
   },
 }, async (request, reply) => {

  const userId = await request.getCurrentUserId()
  const role = await request.getUserRole(userId);
  
  const { cannot } = getUserPermissions(userId, role.name)

  if(cannot('get', 'transactions')){
   throw new UnauthorizedError('You do not have permission to view categories')
  }

  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
  })

  const formattedCategories = categories.map(category => ({
   ...category,
   createdAt: category.createdAt.toISOString(), 
   updatedAt: category.updatedAt ? category.updatedAt.toISOString() : null, 
 }));

  return reply.status(200).send(formattedCategories)
 })
}