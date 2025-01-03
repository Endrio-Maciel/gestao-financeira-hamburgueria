import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from 'zod';
import { prisma } from "../../../lib/prisma";
import { auth } from "../../middlewares/auth";

export async function getAllTransactions(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().register(auth).get('/transactions', {
    schema: {
      tags: ['transactions'],
      summary: 'Retrieve all transactions with optional filtering by period',
      security: [{ bearerAuth: [] }],
      querystring: z.object({
       startDate: z.string().optional(),
       endDate: z.string().optional(), 
       type: z.enum(["INCOME", "EXPENSE"]).optional(),
        title: z.string().optional(),
        categoryId: z.string().uuid().optional(),
        page: z.preprocess((val) => Number(val), z.number().default(1)),
        perPage: z.preprocess((val) => Number(val), z.number().default(10)),
      }),
      response: {
       200: z.object({
        transactions: z.array(
         z.object({
          id: z.string(),
          type: z.enum(["INCOME", "EXPENSE"]),
          title: z.string(),
          description: z.string().nullable(),
          amount: z.number(),
          dueDate: z.string().nullable(),
          paymentDate: z.string().nullable(),
          createdAt: z.string(),
          updatedAt: z.string(),
          categoryId: z.string().nullable(),
         })
        ),
        total: z.number(), 
        page: z.number(),
        perPage: z.number(),
       }),
     },
   },
  }, async (request, reply) => {
   const {startDate, endDate, type, title, categoryId, page, perPage} = request.query
   
   const filters: Record<string, any> = {}
   if(startDate) {
    filters.createdAt = { gte: new Date(startDate) }
   }
   if(endDate) {
    filters.createdAt = filters.createdAt
    ? {...filters.createdAt, lte: new Date(endDate)}
    : { lte: new Date(endDate)}
   }
   if(type) {
    filters.type = type
   }
   if(title) {
    filters.title = { contains: title, mode: "insensitive" };
   }
   if (categoryId) {
    filters.categoryId = categoryId;
  }

   const skip = (page - 1) * perPage

   const [transactions, total] = await prisma.$transaction([
    prisma.transactions.findMany({
      where: filters,
      orderBy: { createdAt: "desc" },
      skip,
      take: perPage,
      include: { category: true },
    }),
    prisma.transactions.count({
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

})}
