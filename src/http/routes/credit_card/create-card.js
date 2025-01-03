"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCreditCard = createCreditCard;
const zod_1 = require("zod");
const prisma_1 = require("../../../lib/prisma");
const auth_1 = require("../../middlewares/auth");
const get_user_permissions_1 = require("../../../utils/get-user-permissions");
const unauthorized_error_1 = require("../_errors/unauthorized-error");
const bad_request_error_1 = require("../_errors/bad-request-error");
async function createCreditCard(app) {
    app.withTypeProvider().register(auth_1.auth).post('/credit-cards/register', {
        schema: {
            tags: ['credit-cards'],
            summary: 'Create a new credit card',
            security: [{ bearerAuth: [] }],
            body: zod_1.z.object({
                name: zod_1.z.string(),
                limit: zod_1.z.coerce.number().min(0),
                closingDate: zod_1.z.number().int().min(1).max(31),
                dueDate: zod_1.z.number().int().min(1).max(31),
                accountId: zod_1.z.string(),
            }),
            response: {
                201: zod_1.z.object({
                    name: zod_1.z.string(),
                    id: zod_1.z.string().uuid(),
                    limit: zod_1.z.number(),
                    closingDate: zod_1.z.number().int(),
                    dueDate: zod_1.z.number().int(),
                    accountId: zod_1.z.string(),
                    available: zod_1.z.number(),
                    createdAt: zod_1.z.date(),
                    updatedAt: zod_1.z.date().nullable(),
                })
            },
        },
    }, async (request, reply) => {
        const userId = await request.getCurrentUserId();
        const role = await request.getUserRole(userId);
        const { cannot } = (0, get_user_permissions_1.getUserPermissions)(userId, role.name);
        if (cannot('create', 'credit_cards')) {
            throw new unauthorized_error_1.UnauthorizedError('You do not have permission to create a credit card');
        }
        const { name, limit, closingDate, dueDate, accountId } = request.body;
        const account = await prisma_1.prisma.account.findUnique({
            where: { id: accountId }
        });
        if (!account) {
            throw new bad_request_error_1.BadRequestError('Account not found.');
        }
        const creditCard = await prisma_1.prisma.creditCard.create({
            data: {
                name,
                limit,
                available: limit,
                closingDate,
                dueDate,
                accountId
            }
        });
        return reply.status(201).send(creditCard);
    });
}
