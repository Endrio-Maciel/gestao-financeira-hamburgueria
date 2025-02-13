import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from 'zod'
import { prisma } from "../../../lib/client";
import { auth } from "../../middlewares/auth";
import { getUserPermissions } from "../../../utils/get-user-permissions";
import { UnauthorizedError } from "../_errors/unauthorized-error";
import { BadRequestError } from "../_errors/bad-request-error";

export async function deleteCategory(app: FastifyInstance) {
 app.withTypeProvider<ZodTypeProvider>().register(auth).delete('/categories/:id/delete', {
   schema: {
    tags: ['categories'],
    summary: 'Delete a category',
    security: [{ bearerAuth: []}],
    params: z.object({
     id: z.string().uuid()
    }),
    response: {
     204: z.null()
   },
   },
 }, async (request, reply) => {

  const userId = await request.getCurrentUserId()
  const role = await request.getUserRole(userId);
  
  const { cannot } = getUserPermissions(userId, role.name)

  if(cannot('delete', 'categories')){
   throw new UnauthorizedError('You do not have permission to delete a category')
  }

  const { id } = request.params

  const categoryExisting = await prisma.category.findUnique({
   where: { id }
  })

  if(!categoryExisting){
   throw new BadRequestError('Category not found.')
  }

  await prisma.category.delete({
   where: { id } 
  })

  return reply.status(204).send()
 })
}