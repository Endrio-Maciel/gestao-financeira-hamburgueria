import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from 'zod'
import { prisma } from "../../../lib/client";
import { auth } from "../../middlewares/auth";
import { getUserPermissions } from "../../../utils/get-user-permissions";
import { UnauthorizedError } from "../_errors/unauthorized-error";
import { BadRequestError } from "../_errors/bad-request-error";

export async function registerTransaction(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post('/transactions/register', {
      schema: {
        tags: ['transactions'],
        summary: 'Create a new transaction (income or expense)',
        security: [{ bearerAuth: [] }],
        body: z.object({
          type: z.enum(['INCOME', 'EXPENSE']),
          title: z.string().min(1, 'Title is required'),
          description: z.string().optional(),
          amount: z.number().positive('Amount must be greater than zero'),
          dueDate: z.string().optional(),
          paymentDate: z.string().optional(),
          categoryId: z.string().uuid().optional(),
          creditCardId: z.string().optional(),
          accountId: z.string(),
        }),
        response: {
          201: z.object({
            id: z.string(),
            type: z.enum(['INCOME', 'EXPENSE']),
            title: z.string(),
            description: z.string().nullable(),
            amount: z.number(),
            dueDate: z.string().nullable(),
            paymentDate: z.string().nullable(),
            isFinalized: z.boolean(),
            createdAt: z.string(),
            updatedAt: z.string(),
            categoryId: z.string().nullable(),
            accountId: z.string(),
            creditCardId: z.string().nullable(),
          }),
        },
      },
    }, async (request, reply) => {
      try {
        const userId = await request.getCurrentUserId();
        const role = await request.getUserRole(userId);
        const { cannot } = getUserPermissions(userId, role.name);

        if (cannot('create', 'transactions')) {
          throw new UnauthorizedError('You do not have permission to create a transaction');
        }

        console.log("Dados recebidos no backend:", request.body);

        const { type, title, description, amount, dueDate, paymentDate, categoryId, accountId, creditCardId } = request.body;

        const account = await prisma.account.findUnique({
          where: { id: accountId },
        });

        if (!account) {
          throw new BadRequestError("Conta não encontrada" )
        }

        const isFinalized = !!paymentDate;
        const updatedBalance = type === 'INCOME' ? account.balance + amount : account.balance - amount;

        if (updatedBalance < 0) {
          throw new BadRequestError("Conta não encontrada")
        }

        await prisma.account.update({
          where: { id: accountId },
          data: { balance: updatedBalance },
        });

        const transaction = await prisma.transactions.create({
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
          include: { creditCard: true },
        });

        return reply.status(201).send({
          id: transaction.id,
          type: transaction.type,
          title: transaction.title,
          description: transaction.description,
          amount: transaction.amount,
          dueDate: transaction.dueDate ? transaction.dueDate.toISOString() : null,
          paymentDate: transaction.paymentDate ? transaction.paymentDate.toISOString() : null,
          isFinalized: transaction.isFinalized,
          createdAt: transaction.createdAt.toISOString(),
          updatedAt: transaction.updatedAt.toISOString(),
          categoryId: transaction.categoryId,
          accountId: transaction.accountId,
          creditCardId: transaction.creditCard?.id || null,
        });
      } catch (err) {
        throw new BadRequestError('Erro interno ao processar a transação.')
      }
    })
}
