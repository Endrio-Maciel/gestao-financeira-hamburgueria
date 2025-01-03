"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTransaction = deleteTransaction;
const zod_1 = require("zod");
const prisma_1 = require("../../../lib/prisma");
const auth_1 = require("../../middlewares/auth");
const get_user_permissions_1 = require("../../../utils/get-user-permissions");
const unauthorized_error_1 = require("../_errors/unauthorized-error");
const bad_request_error_1 = require("../_errors/bad-request-error");
async function deleteTransaction(app) {
    app.withTypeProvider().register(auth_1.auth).delete('/transactions/:id/delete', {
        schema: {
            tags: ['transactions'],
            summary: 'delete a transaction',
            security: [{ bearerAuth: [] }],
            params: zod_1.z.object({
                id: zod_1.z.string().uuid(),
            }),
            response: {
                200: zod_1.z.null()
            },
        },
    }, async (request, reply) => {
        const userId = await request.getCurrentUserId();
        const role = await request.getUserRole(userId);
        const { cannot } = (0, get_user_permissions_1.getUserPermissions)(userId, role.name);
        if (cannot('delete', 'transactions')) {
            throw new unauthorized_error_1.UnauthorizedError('You do not have permission to modify this transaction.');
        }
        const { id } = request.params;
        const existingTransaction = await prisma_1.prisma.transactions.findUnique({ where: { id } });
        if (!existingTransaction) {
            throw new bad_request_error_1.BadRequestError('Transaction not found.');
        }
        await prisma_1.prisma.transactions.delete({
            where: { id }
        });
        return reply.status(200).send();
    });
}
