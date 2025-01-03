"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerTransaction = registerTransaction;
const zod_1 = require("zod");
const prisma_1 = require("../../../lib/prisma");
const auth_1 = require("../../middlewares/auth");
const get_user_permissions_1 = require("../../../utils/get-user-permissions");
const unauthorized_error_1 = require("../_errors/unauthorized-error");
async function registerTransaction(app) {
    app.withTypeProvider().register(auth_1.auth).post('/transactions/register', {
        schema: {
            tags: ['transactions'],
            summary: 'Create a new transaction (income or expense)',
            security: [{ bearerAuth: [] }],
            body: zod_1.z.object({
                type: zod_1.z.enum(['INCOME', 'EXPENSE']),
                title: zod_1.z.string().min(1, 'Title is required'),
                description: zod_1.z.string().optional(),
                amount: zod_1.z.number().positive('Amount must be greater than zero'),
                dueDate: zod_1.z.string().optional(),
                paymentDate: zod_1.z.string().optional(),
                categoryId: zod_1.z.string().uuid().optional(),
                creditCardId: zod_1.z.string().optional(),
                accountId: zod_1.z.string(),
            }),
            response: {
                201: zod_1.z.object({
                    id: zod_1.z.string(),
                    type: zod_1.z.enum(['INCOME', 'EXPENSE']),
                    title: zod_1.z.string(),
                    description: zod_1.z.string().nullable(),
                    amount: zod_1.z.number(),
                    dueDate: zod_1.z.string().nullable(),
                    paymentDate: zod_1.z.string().nullable(),
                    isFinalized: zod_1.z.boolean().optional().default(false),
                    createdAt: zod_1.z.string(),
                    updatedAt: zod_1.z.string(),
                    categoryId: zod_1.z.string().nullable(),
                    accountId: zod_1.z.string().nullable(),
                    creditCardId: zod_1.z.string().nullable(),
                }),
            },
        },
    }, async (request, reply) => {
        const userId = await request.getCurrentUserId();
        const role = await request.getUserRole(userId);
        const { cannot } = (0, get_user_permissions_1.getUserPermissions)(userId, role.name);
        if (cannot('create', 'transactions')) {
            throw new unauthorized_error_1.UnauthorizedError('You do not have permission to create a transaction');
        }
        const { type, title, description, amount, dueDate, paymentDate, categoryId, accountId, creditCardId } = request.body;
        const isFinalized = paymentDate ? true : false;
        const transaction = await prisma_1.prisma.transactions.create({
            data: {
                type,
                title,
                description: description || null,
                amount,
                dueDate: dueDate ? new Date(dueDate) : null,
                paymentDate: paymentDate ? new Date(paymentDate) : null,
                isFinalized,
                categoryId,
                userId,
                accountId,
                creditCardId: creditCardId || null,
            },
            include: { creditCard: true }
        });
        return reply.status(201).send({
            id: transaction.id,
            type: transaction.type,
            title: transaction.title,
            description: transaction.description,
            amount: transaction.amount,
            dueDate: transaction.dueDate
                ? transaction.dueDate.toISOString()
                : null,
            paymentDate: transaction.paymentDate
                ? transaction.paymentDate.toISOString()
                : null,
            isFinalized: transaction.isFinalized,
            createdAt: transaction.createdAt.toISOString(),
            updatedAt: transaction.updatedAt.toISOString(),
            categoryId: transaction.categoryId,
            accountId: transaction.accountId,
            creditCardId: transaction.creditCard?.id || null,
        });
    });
}
