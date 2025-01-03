"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listCreditCards = listCreditCards;
const zod_1 = require("zod");
const prisma_1 = require("../../../lib/prisma");
const auth_1 = require("../../middlewares/auth");
const get_user_permissions_1 = require("../../../utils/get-user-permissions");
const unauthorized_error_1 = require("../_errors/unauthorized-error");
async function listCreditCards(app) {
    app.withTypeProvider().register(auth_1.auth).get('/credit-cards/', {
        schema: {
            tags: ['credit-cards'],
            summary: 'list all credit cards with the option to filter by bank account',
            security: [{ bearerAuth: [] }],
            querystring: zod_1.z.object({
                accountId: zod_1.z.string().optional(),
            })
        },
    }, async (request, reply) => {
        const userId = await request.getCurrentUserId();
        const role = await request.getUserRole(userId);
        const { cannot } = (0, get_user_permissions_1.getUserPermissions)(userId, role.name);
        if (cannot('get', 'credit_cards')) {
            throw new unauthorized_error_1.UnauthorizedError('You do not have permission to list credit card');
        }
        const { accountId } = request.query;
        const creditCards = await prisma_1.prisma.creditCard.findMany({
            where: {
                ...(accountId ? { accountId } : {}),
            },
            include: {
                transactions: true,
            }
        });
        const formattedCards = creditCards.map((card) => {
            const usedAmount = card.transactions.reduce((sum, transaction) => {
                if (transaction.type === 'EXPENSE' && transaction.isFinalized) {
                    return sum + transaction.amount;
                }
                return sum;
            }, 0);
            return {
                id: card.id,
                name: card.name,
                limit: card.limit,
                usedAmount,
                available: card.limit - usedAmount,
                closingDate: card.closingDate,
                dueDate: card.dueDate,
            };
        });
        return reply.status(201).send(formattedCards);
    });
}
