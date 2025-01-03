"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listCategories = listCategories;
const zod_1 = require("zod");
const prisma_1 = require("../../../lib/prisma");
const auth_1 = require("../../middlewares/auth");
const get_user_permissions_1 = require("../../../utils/get-user-permissions");
const unauthorized_error_1 = require("../_errors/unauthorized-error");
async function listCategories(app) {
    app.withTypeProvider().register(auth_1.auth).get('/categories', {
        schema: {
            tags: ['categories'],
            summary: 'List all categories',
            security: [{ bearerAuth: [] }],
            response: {
                200: zod_1.z.array(zod_1.z.object({
                    id: zod_1.z.string(),
                    name: zod_1.z.string(),
                    description: zod_1.z.string().nullable(),
                    createdAt: zod_1.z.coerce.string(),
                    updatedAt: zod_1.z.coerce.string().nullable(),
                }))
            },
        },
    }, async (request, reply) => {
        const userId = await request.getCurrentUserId();
        const role = await request.getUserRole(userId);
        const { cannot } = (0, get_user_permissions_1.getUserPermissions)(userId, role.name);
        if (cannot('get', 'transactions')) {
            throw new unauthorized_error_1.UnauthorizedError('You do not have permission to view categories');
        }
        const categories = await prisma_1.prisma.category.findMany({
            orderBy: { name: 'asc' },
        });
        const formattedCategories = categories.map(category => ({
            ...category,
            createdAt: category.createdAt.toISOString(),
            updatedAt: category.updatedAt ? category.updatedAt.toISOString() : null,
        }));
        return reply.status(200).send(formattedCategories);
    });
}
