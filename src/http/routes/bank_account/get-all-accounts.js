"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllAccount = getAllAccount;
const zod_1 = require("zod");
const prisma_1 = require("../../../lib/prisma");
const auth_1 = require("../../middlewares/auth");
const get_user_permissions_1 = require("../../../utils/get-user-permissions");
const unauthorized_error_1 = require("../_errors/unauthorized-error");
async function getAllAccount(app) {
    app.withTypeProvider().register(auth_1.auth).get('/accounts', {
        schema: {
            tags: ['bank_account'],
            summary: 'Get list of accounts',
            security: [{ bearerAuth: [] }],
            querystring: zod_1.z.object({
                name: zod_1.z.string().optional(),
            }),
            response: {
                200: zod_1.z.object({
                    accounts: zod_1.z.array(zod_1.z.object({
                        name: zod_1.z.string(),
                        id: zod_1.z.string(),
                        type: zod_1.z.enum([
                            'CASH', 'BANK_ACCOUNT', 'IFOOD_ACCOUNT', 'INVESTMENT_BOX',
                            'EMERGENCY_RESERVE', 'CREDIT_CARD'
                        ]),
                        balance: zod_1.z.number(),
                    })),
                    total: zod_1.z.number(),
                }),
            },
        },
    }, async (request, reply) => {
        const userId = await request.getCurrentUserId();
        const role = await request.getUserRole(userId);
        const { cannot } = (0, get_user_permissions_1.getUserPermissions)(userId, role.name);
        if (cannot('get', 'categories')) {
            throw new unauthorized_error_1.UnauthorizedError('You do not have permission to view accounts');
        }
        const { name } = request.query;
        const filter = {};
        if (name) {
            filter.name = { contains: name, mode: "insensitive" };
        }
        const [accounts, total] = await prisma_1.prisma.$transaction([
            prisma_1.prisma.account.findMany({
                where: filter,
                orderBy: { name: "desc" },
                include: { _count: true },
            }),
            prisma_1.prisma.account.count({
                where: filter,
            }),
        ]);
        return reply.send({
            accounts,
            total,
        });
    });
}
