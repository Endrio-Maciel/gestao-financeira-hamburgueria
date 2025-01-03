"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBankAccount = createBankAccount;
const zod_1 = require("zod");
const prisma_1 = require("../../../lib/prisma");
const auth_1 = require("../../middlewares/auth");
const get_user_permissions_1 = require("../../../utils/get-user-permissions");
const unauthorized_error_1 = require("../_errors/unauthorized-error");
const bad_request_error_1 = require("../_errors/bad-request-error");
async function createBankAccount(app) {
    app.withTypeProvider().register(auth_1.auth).post('/account/register', {
        schema: {
            tags: ['bank_account'],
            summary: 'Create a new account, types of account: CASH, BANK_ACCOUNT,IFOOD_ACCOUNT,INVESTMENT_BOX,EMERGENCY_RESERVE,CREDIT_CARD',
            security: [{ bearerAuth: [] }],
            body: zod_1.z.object({
                name: zod_1.z.string(),
                type: zod_1.z.enum(['CASH', 'BANK_ACCOUNT', 'IFOOD_ACCOUNT', 'INVESTMENT_BOX', 'EMERGENCY_RESERVE', 'CREDIT_CARD']),
                balance: zod_1.z.number().optional(),
            }),
            response: {
                201: zod_1.z.object({
                    id: zod_1.z.string(),
                    name: zod_1.z.string(),
                    type: zod_1.z.enum(['CASH', 'BANK_ACCOUNT', 'IFOOD_ACCOUNT', 'INVESTMENT_BOX', 'EMERGENCY_RESERVE', 'CREDIT_CARD']),
                })
            },
        },
    }, async (request, reply) => {
        const userId = await request.getCurrentUserId();
        const role = await request.getUserRole(userId);
        const { cannot } = (0, get_user_permissions_1.getUserPermissions)(userId, role.name);
        if (cannot('create', 'categories')) {
            throw new unauthorized_error_1.UnauthorizedError('You do not have permission to create a account');
        }
        const { name, type, balance } = request.body;
        const existingAccount = await prisma_1.prisma.category.findUnique({
            where: { name }
        });
        if (existingAccount) {
            throw new bad_request_error_1.BadRequestError('There is already a category with that name.');
        }
        const account = await prisma_1.prisma.account.create({
            data: {
                name,
                type,
                balance
            }
        });
        return reply.status(201).send(account);
    });
}
