"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listInvoices = listInvoices;
const zod_1 = require("zod");
const prisma_1 = require("../../../lib/prisma");
const auth_1 = require("../../middlewares/auth");
const get_user_permissions_1 = require("../../../utils/get-user-permissions");
const unauthorized_error_1 = require("../_errors/unauthorized-error");
const bad_request_error_1 = require("../_errors/bad-request-error");
async function listInvoices(app) {
    app.withTypeProvider().register(auth_1.auth).get('/credit-cards/:id/invoices', {
        schema: {
            tags: ['credit-cards'],
            summary: 'List invoices for a credit card',
            security: [{ bearerAuth: [] }],
            params: zod_1.z.object({
                id: zod_1.z.string().optional(),
            }),
            querystring: zod_1.z.object({
                month: zod_1.z.number().int().min(1).max(12).optional(),
                year: zod_1.z.number().int().optional(),
            }),
            response: {
                200: zod_1.z.array(zod_1.z.object({
                    id: zod_1.z.string().uuid(),
                    month: zod_1.z.number().int(),
                    year: zod_1.z.number().int(),
                    totalAmount: zod_1.z.number(),
                    closingDate: zod_1.z.date(),
                    dueDate: zod_1.z.date(),
                    transactions: zod_1.z.array(zod_1.z.object({
                        id: zod_1.z.string().uuid(),
                        title: zod_1.z.string(),
                        amount: zod_1.z.number(),
                        createdAt: zod_1.z.date(),
                    }))
                }))
            }
        },
    }, async (request, reply) => {
        const userId = await request.getCurrentUserId();
        const role = await request.getUserRole(userId);
        const { cannot } = (0, get_user_permissions_1.getUserPermissions)(userId, role.name);
        if (cannot('get', 'credit_cards')) {
            throw new unauthorized_error_1.UnauthorizedError('You do not have permission to view invoices');
        }
        const { id } = request.params;
        const { month, year } = request.query;
        const creditCard = await prisma_1.prisma.creditCard.findUnique({ where: { id } });
        if (!creditCard) {
            throw new bad_request_error_1.BadRequestError('Credit card not found');
        }
        const filters = { creditCardId: id };
        if (month !== undefined)
            filters.month;
        if (year !== undefined)
            filters.year = year;
        const invoices = await prisma_1.prisma.creditCardInvoice.findMany({
            where: filters,
            include: {
                transactions: {
                    select: {
                        id: true,
                        title: true,
                        amount: true,
                        createdAt: true,
                    },
                },
            },
        });
        return reply.status(200).send(invoices);
    });
}
