import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from 'zod'
import { prisma } from "../../../lib/prisma";
import { auth } from "../../middlewares/auth";
import { getUserPermissions } from "../../../utils/get-user-permissions";
import { UnauthorizedError } from "../_errors/unauthorized-error";
import { BadRequestError } from "../_errors/bad-request-error";

export async function createBankAccount(app: FastifyInstance) {
 app.withTypeProvider<ZodTypeProvider>().register(auth).post('/account/register', {
   schema: {
    tags: ['bank_account'],
    summary: 'Create a new account, types of account: CASH, BANK_ACCOUNT,IFOOD_ACCOUNT,INVESTMENT_BOX,EMERGENCY_RESERVE,CREDIT_CARD',
    security: [{ bearerAuth: []}],
    body: z.object({
     name: z.string(),
     balance: z.number().optional().default(0),
    }),
    response: {
     201: z.object({
        id: z.string(),
        name: z.string(),
        balance: z.number().default(0),
        type: z.enum(['CASH', 'BANK_ACCOUNT','IFOOD_ACCOUNT','INVESTMENT_BOX','EMERGENCY_RESERVE','CREDIT_CARD']),
     })
   },
   },
 }, async (request, reply) => {
  
  const userId = await request.getCurrentUserId()
  const role = await request.getUserRole(userId);
  
  const { cannot } = getUserPermissions(userId, role.name)

  if(cannot('create', 'categories')){
   throw new UnauthorizedError('You do not have permission to create a account')
  }

  const {name, balance} = request.body;

  const existingAccount = await prisma.account.findUnique({
    where: { name }
  })

  if(existingAccount) {
    throw new BadRequestError('There is already a category with that name.')
  }

  const account = await prisma.account.create({
    data: {
     name,
     type: 'BANK_ACCOUNT',
     balance
    }
  })

  return reply.status(201).send(account)
 })
}