"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatedCreditCard = updatedCreditCard;
const zod_1 = require("zod");
const prisma_1 = require("../../../lib/prisma");
const auth_1 = require("../../middlewares/auth");
const get_user_permissions_1 = require("../../../utils/get-user-permissions");
const unauthorized_error_1 = require("../_errors/unauthorized-error");
const bad_request_error_1 = require("../_errors/bad-request-error");
async function updatedCreditCard(app) {
    app.withTypeProvider().register(auth_1.auth).put('/credit-cards/:id', {
        schema: {
            tags: ['credit-cards'],
            summary: 'updated credit card',
            security: [{ bearerAuth: [] }],
            body: zod_1.z.object({
                name: zod_1.z.string().optional(),
                limit: zod_1.z.coerce.number().min(0).optional(),
                closingDate: zod_1.z.number().int().optional(),
                dueDate: zod_1.z.number().int().optional(),
            }),
            params: zod_1.z.object({
                id: zod_1.z.string(),
            }),
            response: {
                201: zod_1.z.object({
                    name: zod_1.z.string(),
                    id: zod_1.z.string().uuid(),
                    limit: zod_1.z.number(),
                    closingDate: zod_1.z.number().int(),
                    dueDate: zod_1.z.number().int(),
                    available: zod_1.z.number(),
                    createdAt: zod_1.z.date(),
                    updatedAt: zod_1.z.date().nullable(),
                    accountId: zod_1.z.string(),
                })
            },
        },
    }, async (request, reply) => {
        const userId = await request.getCurrentUserId();
        const role = await request.getUserRole(userId);
        const { cannot } = (0, get_user_permissions_1.getUserPermissions)(userId, role.name);
        if (cannot('update', 'credit_cards')) {
            throw new unauthorized_error_1.UnauthorizedError('You do not have permission to updated a credit card');
        }
        const { id } = request.params;
        const updates = request.body;
        const existingCard = await prisma_1.prisma.creditCard.findMany({
            where: { id }
        });
        if (!existingCard) {
            throw new bad_request_error_1.BadRequestError('Card not found.');
        }
        const creditCard = await prisma_1.prisma.creditCard.update({
            where: { id },
            data: updates,
        });
        return reply.status(201).send(creditCard);
    });
}
