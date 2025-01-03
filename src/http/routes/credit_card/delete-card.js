"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCreditCard = deleteCreditCard;
const zod_1 = require("zod");
const prisma_1 = require("../../../lib/prisma");
const auth_1 = require("../../middlewares/auth");
const get_user_permissions_1 = require("../../../utils/get-user-permissions");
const unauthorized_error_1 = require("../_errors/unauthorized-error");
const bad_request_error_1 = require("../_errors/bad-request-error");
async function deleteCreditCard(app) {
    app.withTypeProvider().register(auth_1.auth).delete('/credit-cards/:id/delete', {
        schema: {
            tags: ['credit-cards'],
            summary: 'Delete credit card',
            security: [{ bearerAuth: [] }],
            params: zod_1.z.object({
                id: zod_1.z.string(),
            }),
            response: {
                204: zod_1.z.null()
            },
        },
    }, async (request, reply) => {
        const userId = await request.getCurrentUserId();
        const role = await request.getUserRole(userId);
        const { cannot } = (0, get_user_permissions_1.getUserPermissions)(userId, role.name);
        if (cannot('delete', 'credit_cards')) {
            throw new unauthorized_error_1.UnauthorizedError('You do not have permission to create a credit card');
        }
        const { id } = request.params;
        const cardExisting = await prisma_1.prisma.category.findUnique({
            where: { id }
        });
        if (!cardExisting) {
            throw new bad_request_error_1.BadRequestError('Credit card not found.');
        }
        const transaction = await prisma_1.prisma.transactions.findMany({
            where: { creditCardId: id }
        });
        if (transaction.length > 0) {
            throw new bad_request_error_1.BadRequestError('Cannot delete a credit card with linked transactions');
        }
        await prisma_1.prisma.creditCard.delete({
            where: { id }
        });
        return reply.status(204).send();
    });
}
