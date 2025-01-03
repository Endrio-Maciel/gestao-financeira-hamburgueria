"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changeTransaction = changeTransaction;
const zod_1 = require("zod");
const prisma_1 = require("../../../lib/prisma");
const auth_1 = require("../../middlewares/auth");
const get_user_permissions_1 = require("../../../utils/get-user-permissions");
const unauthorized_error_1 = require("../_errors/unauthorized-error");
const bad_request_error_1 = require("../_errors/bad-request-error");
async function changeTransaction(app) {
    app.withTypeProvider().register(auth_1.auth).put('/transactions/:id/change', {
        schema: {
            tags: ['transactions'],
            summary: 'Change a transaction',
            security: [{ bearerAuth: [] }],
            params: zod_1.z.object({
                id: zod_1.z.string().uuid(),
            }),
            body: zod_1.z.object({
                type: zod_1.z.enum(["INCOME", "EXPENSE"]).optional(),
                title: zod_1.z.string().optional(),
                description: zod_1.z.string().nullable().optional(),
                amount: zod_1.z.number().positive().optional(),
                dueDate: zod_1.z.string().nullable().optional(),
                paymentDate: zod_1.z.string().nullable().optional(),
                categoryId: zod_1.z.string().uuid().optional(),
            }),
            response: {
                200: zod_1.z.object({
                    id: zod_1.z.string(),
                    type: zod_1.z.enum(["INCOME", "EXPENSE"]),
                    title: zod_1.z.string(),
                    description: zod_1.z.string().nullable(),
                    amount: zod_1.z.number(),
                    dueDate: zod_1.z.string().nullable(),
                    paymentDate: zod_1.z.string().nullable(),
                    isFinalized: zod_1.z.boolean(),
                    createdAt: zod_1.z.string(),
                    updatedAt: zod_1.z.string(),
                }),
            },
        },
    }, async (request, reply) => {
        const userId = await request.getCurrentUserId();
        const role = await request.getUserRole(userId);
        const { cannot } = (0, get_user_permissions_1.getUserPermissions)(userId, role.name);
        if (cannot('update', 'transactions')) {
            throw new unauthorized_error_1.UnauthorizedError('You do not have permission to modify this transaction.');
        }
        const { id } = request.params;
        const { type, title, description, amount, dueDate, paymentDate, categoryId } = request.body;
        const existingTransaction = await prisma_1.prisma.transactions.findUnique({ where: { id } });
        if (!existingTransaction) {
            throw new bad_request_error_1.BadRequestError('Transaction not found.');
        }
        const updateData = {};
        if (type)
            updateData.type = type;
        if (title)
            updateData.title = title;
        if (description !== undefined)
            updateData.description = description;
        if (amount !== undefined)
            updateData.amount = amount;
        if (dueDate)
            updateData.dueDate = new Date(dueDate);
        if (paymentDate) {
            updateData.paymentDate = new Date(paymentDate);
            updateData.isFinalized = true;
        }
        if (categoryId) {
            updateData.categoyId = categoryId;
        }
        const updatedTransaction = await prisma_1.prisma.transactions.update({
            where: { id },
            data: updateData,
        });
        return reply.status(200).send({
            id: updatedTransaction.id,
            type: updatedTransaction.type,
            title: updatedTransaction.title,
            description: updatedTransaction.description,
            amount: updatedTransaction.amount,
            dueDate: updatedTransaction.dueDate
                ? updatedTransaction.dueDate.toISOString()
                : null,
            paymentDate: updatedTransaction.paymentDate
                ? updatedTransaction.paymentDate.toISOString()
                : null,
            isFinalized: updatedTransaction.isFinalized,
            createdAt: updatedTransaction.createdAt.toISOString(),
            updatedAt: updatedTransaction.updatedAt.toISOString(),
        });
    });
}
