import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from 'zod';
import { prisma } from "../../../lib/client";
import { auth } from "../../middlewares/auth";
import { getUserPermissions } from "../../../utils/get-user-permissions";
import { UnauthorizedError } from "../_errors/unauthorized-error";
import { BadRequestError } from "../_errors/bad-request-error";

export async function updatedCategory(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().register(auth).put('/categories/:id/change', {
    schema: {
      tags: ['categories'],
      summary: 'Update a category',
      security: [{ bearerAuth: [] }],
      params: z.object({
        id: z.string(),
      }),
      body: z.object({
        name: z.string().optional(),
        description: z.string().nullable().optional(),
      }),
      response: {
        200: z.object({
          id: z.string(),
          name: z.string(),
          description: z.string().nullable(),
          createdAt: z.string(),
          updatedAt: z.string().nullable(),
        }),
      },
    },
  }, async (request, reply) => {
    
    const userId = await request.getCurrentUserId();
    const role = await request.getUserRole(userId);
    
    const { cannot } = getUserPermissions(userId, role.name);

    if (cannot('update', 'categories')) {
      throw new UnauthorizedError('You do not have permission to update a category.');
    }

    const { id } = request.params;
    const { name, description } = request.body;

    const categoryExisting = await prisma.category.findUnique({
      where: { id }
    });

    if (!categoryExisting) {
      throw new BadRequestError('Category not found.');
    }

    const updateData: Record<string, any> = {};

    if (name) updateData.name = name;

    if (description !== undefined) updateData.description = description;

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: updateData,
    });

    return reply.status(200).send({
      id: updatedCategory.id,
      name: updatedCategory.name,
      description: updatedCategory.description,
      createdAt: updatedCategory.createdAt.toISOString(),
      updatedAt: updatedCategory.updatedAt ? updatedCategory.updatedAt.toISOString() : null,
    });
  });
}
