"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAccount = deleteAccount;
const zod_1 = require("zod");
const prisma_1 = require("../../../lib/prisma");
const auth_1 = require("../../middlewares/auth");
const get_user_permissions_1 = require("../../../utils/get-user-permissions");
const unauthorized_error_1 = require("../_errors/unauthorized-error");
const bad_request_error_1 = require("../_errors/bad-request-error");
async function deleteAccount(app) {
    app.withTypeProvider().register(auth_1.auth).delete('/account/:id/delete', {
        schema: {
            tags: ['bank_account'],
            summary: 'delete account',
            security: [{ bearerAuth: [] }],
            params: zod_1.z.object({
                id: zod_1.z.string()
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
            throw new unauthorized_error_1.UnauthorizedError('You do not have permission to delete account');
        }
        const { id } = request.params;
        const accountExisting = await prisma_1.prisma.account.findMany({
            where: { id }
        });
        if (!accountExisting) {
            throw new bad_request_error_1.BadRequestError();
        }
        await prisma_1.prisma.account.delete({
            where: { id }
        });
        return reply.send();
    });
}
