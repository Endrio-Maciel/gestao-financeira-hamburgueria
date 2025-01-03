"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatedCategory = updatedCategory;
const zod_1 = require("zod");
const prisma_1 = require("../../../lib/prisma");
const auth_1 = require("../../middlewares/auth");
const get_user_permissions_1 = require("../../../utils/get-user-permissions");
const unauthorized_error_1 = require("../_errors/unauthorized-error");
const bad_request_error_1 = require("../_errors/bad-request-error");
async function updatedCategory(app) {
    app.withTypeProvider().register(auth_1.auth).put('/categories/:id/change', {
        schema: {
            tags: ['categories'],
            summary: 'Update a category',
            security: [{ bearerAuth: [] }],
            params: zod_1.z.object({
                id: zod_1.z.string().uuid(),
            }),
            body: zod_1.z.object({
                name: zod_1.z.string().optional(),
                description: zod_1.z.string().nullable().optional(),
            }),
            response: {
                200: zod_1.z.object({
                    id: zod_1.z.string(),
                    name: zod_1.z.string(),
                    description: zod_1.z.string().nullable(),
                    createdAt: zod_1.z.string(),
                    updatedAt: zod_1.z.string().nullable(),
                }),
            },
        },
    }, async (request, reply) => {
        const userId = await request.getCurrentUserId();
        const role = await request.getUserRole(userId);
        const { cannot } = (0, get_user_permissions_1.getUserPermissions)(userId, role.name);
        if (cannot('update', 'categories')) {
            throw new unauthorized_error_1.UnauthorizedError('You do not have permission to update a category.');
        }
        const { id } = request.params;
        const { name, description } = request.body;
        const categoryExisting = await prisma_1.prisma.category.findUnique({
            where: { id }
        });
        if (!categoryExisting) {
            throw new bad_request_error_1.BadRequestError('Category not found.');
        }
        const updateData = {};
        if (name)
            updateData.name = name;
        if (description !== undefined)
            updateData.description = description;
        const updatedCategory = await prisma_1.prisma.category.update({
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
