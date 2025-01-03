"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCategory = createCategory;
const zod_1 = require("zod");
const prisma_1 = require("../../../lib/prisma");
const auth_1 = require("../../middlewares/auth");
const get_user_permissions_1 = require("../../../utils/get-user-permissions");
const unauthorized_error_1 = require("../_errors/unauthorized-error");
const bad_request_error_1 = require("../_errors/bad-request-error");
async function createCategory(app) {
    app.withTypeProvider().register(auth_1.auth).post('/categories/register', {
        schema: {
            tags: ['categories'],
            summary: 'Create a new category',
            security: [{ bearerAuth: [] }],
            body: zod_1.z.object({
                name: zod_1.z.string(),
                description: zod_1.z.string().optional(),
            }),
            response: {
                201: zod_1.z.object({
                    id: zod_1.z.string(),
                    name: zod_1.z.string(),
                    description: zod_1.z.string().nullable(),
                    createdAt: zod_1.z.coerce.string(),
                    updatedAt: zod_1.z.coerce.string().nullable(),
                })
            },
        },
    }, async (request, reply) => {
        const userId = await request.getCurrentUserId();
        const role = await request.getUserRole(userId);
        const { cannot } = (0, get_user_permissions_1.getUserPermissions)(userId, role.name);
        if (cannot('create', 'categories')) {
            throw new unauthorized_error_1.UnauthorizedError('You do not have permission to create a category');
        }
        const { name, description } = request.body;
        const existingCategory = await prisma_1.prisma.category.findUnique({
            where: { name }
        });
        if (existingCategory) {
            throw new bad_request_error_1.BadRequestError('There is already a category with that name.');
        }
        const category = await prisma_1.prisma.category.create({
            data: {
                name,
                description,
            }
        });
        const response = {
            ...category,
            createdAt: category.createdAt.toISOString(),
            updatedAt: category.updatedAt ? category.updatedAt.toISOString() : null,
        };
        return reply.status(201).send(response);
    });
}
