"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = deleteCategory;
const zod_1 = require("zod");
const prisma_1 = require("../../../lib/prisma");
const auth_1 = require("../../middlewares/auth");
const get_user_permissions_1 = require("../../../utils/get-user-permissions");
const unauthorized_error_1 = require("../_errors/unauthorized-error");
const bad_request_error_1 = require("../_errors/bad-request-error");
async function deleteCategory(app) {
    app.withTypeProvider().register(auth_1.auth).delete('/categories/:id/delete', {
        schema: {
            tags: ['categories'],
            summary: 'Delete a category',
            security: [{ bearerAuth: [] }],
            params: zod_1.z.object({
                id: zod_1.z.string().uuid()
            }),
            response: {
                204: zod_1.z.null()
            },
        },
    }, async (request, reply) => {
        const userId = await request.getCurrentUserId();
        const role = await request.getUserRole(userId);
        const { cannot } = (0, get_user_permissions_1.getUserPermissions)(userId, role.name);
        if (cannot('delete', 'categories')) {
            throw new unauthorized_error_1.UnauthorizedError('You do not have permission to delete a category');
        }
        const { id } = request.params;
        const categoryExisting = await prisma_1.prisma.category.findUnique({
            where: { id }
        });
        if (!categoryExisting) {
            throw new bad_request_error_1.BadRequestError('Category not found.');
        }
        await prisma_1.prisma.category.delete({
            where: { id }
        });
        return reply.status(204).send();
    });
}
