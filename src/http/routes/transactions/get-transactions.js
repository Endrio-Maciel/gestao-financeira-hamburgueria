"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllTransactions = getAllTransactions;
const zod_1 = require("zod");
const prisma_1 = require("../../../lib/prisma");
const auth_1 = require("../../middlewares/auth");
async function getAllTransactions(app) {
    app.withTypeProvider().register(auth_1.auth).get('/transactions', {
        schema: {
            tags: ['transactions'],
            summary: 'Retrieve all transactions with optional filtering by period',
            security: [{ bearerAuth: [] }],
            querystring: zod_1.z.object({
                startDate: zod_1.z.string().optional(),
                endDate: zod_1.z.string().optional(),
                type: zod_1.z.enum(["INCOME", "EXPENSE"]).optional(),
                title: zod_1.z.string().optional(),
                categoryId: zod_1.z.string().uuid().optional(),
                page: zod_1.z.preprocess((val) => Number(val), zod_1.z.number().default(1)),
                perPage: zod_1.z.preprocess((val) => Number(val), zod_1.z.number().default(10)),
            }),
            response: {
                200: zod_1.z.object({
                    transactions: zod_1.z.array(zod_1.z.object({
                        id: zod_1.z.string(),
                        type: zod_1.z.enum(["INCOME", "EXPENSE"]),
                        title: zod_1.z.string(),
                        description: zod_1.z.string().nullable(),
                        amount: zod_1.z.number(),
                        dueDate: zod_1.z.string().nullable(),
                        paymentDate: zod_1.z.string().nullable(),
                        createdAt: zod_1.z.string(),
                        updatedAt: zod_1.z.string(),
                        categoryId: zod_1.z.string().nullable(),
                    })),
                    total: zod_1.z.number(),
                    page: zod_1.z.number(),
                    perPage: zod_1.z.number(),
                }),
            },
        },
    }, async (request, reply) => {
        const { startDate, endDate, type, title, categoryId, page, perPage } = request.query;
        const filters = {};
        if (startDate) {
            filters.createdAt = { gte: new Date(startDate) };
        }
        if (endDate) {
            filters.createdAt = filters.createdAt
                ? { ...filters.createdAt, lte: new Date(endDate) }
                : { lte: new Date(endDate) };
        }
        if (type) {
            filters.type = type;
        }
        if (title) {
            filters.title = { contains: title, mode: "insensitive" };
        }
        if (categoryId) {
            filters.categoryId = categoryId;
        }
        const skip = (page - 1) * perPage;
        const [transactions, total] = await prisma_1.prisma.$transaction([
            prisma_1.prisma.transactions.findMany({
                where: filters,
                orderBy: { createdAt: "desc" },
                skip,
                take: perPage,
                include: { category: true },
            }),
            prisma_1.prisma.transactions.count({
                where: filters,
            }),
        ]);
        const formattedTransactions = transactions.map((transaction) => ({
            ...transaction,
            dueDate: transaction.dueDate?.toISOString() ?? null,
            paymentDate: transaction.paymentDate?.toISOString() ?? null,
            createdAt: transaction.createdAt.toISOString(),
            updatedAt: transaction.updatedAt.toISOString(),
            category: transaction.category ? {
                id: transaction.category.id,
                name: transaction.category.name,
                description: transaction.category.description,
            } : null,
        }));
        return reply.status(200).send({
            transactions: formattedTransactions,
            total,
            page,
            perPage,
        });
    });
}
