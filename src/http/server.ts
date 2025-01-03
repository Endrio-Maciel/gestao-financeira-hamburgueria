import fastify from "fastify";
import { env } from "../env/env";
import fastifyJwt from '@fastify/jwt'
import fastifySwagger from "@fastify/swagger";
import { jsonSchemaTransform, serializerCompiler, ZodTypeProvider, validatorCompiler } from "fastify-type-provider-zod";
import fastifyCors from "@fastify/cors";
import fastifySwaggerUi from "@fastify/swagger-ui";
import { errorHandler } from "./error-handler";
import { authenticateWithPassword } from "./routes/auth/authenticate-with-password";
import { requestPasswordRecover } from "./routes/auth/request-password-recover";
import { resetPassword } from "./routes/auth/reset-password";
import { getProfile } from "./routes/users/get-my-profile";
import { registerTransaction } from "./routes/transactions/register-transaction";
import { changeTransaction } from "./routes/transactions/change-transaction";
import { getAllTransactions } from "./routes/transactions/get-transactions";
import { deleteTransaction } from "./routes/transactions/delete-transaction";
import { createCategory } from "./routes/categories/create-category";
import { deleteCategory } from "./routes/categories/delete-category";
import { listCategories } from "./routes/categories/list-categories";
import { updatedCategory } from "./routes/categories/updated-category";
import { getFinancialSummary } from "./routes/transactions/get-financial-sumary";
import { createCreditCard } from "./routes/credit_card/create-card";
import { deleteCreditCard } from "./routes/credit_card/delete-card";
import { listCreditCards } from "./routes/credit_card/list-cards";
import { updatedCreditCard } from "./routes/credit_card/updated-card";
import { closeInvoiceRoute } from "./routes/credit_card/close-invoice";
import { listInvoices } from "./routes/credit_card/list-invoices";
import { deleteAccount } from "./routes/bank_account/delete-account";
import { getAllAccount } from "./routes/bank_account/get-all-accounts";
import { createBankAccount } from "./routes/bank_account/create-bank-account";
import { createAccount } from "./routes/auth/create-account";
import { prisma } from "../lib/prisma";

export const app = fastify().withTypeProvider<ZodTypeProvider>()

app.setSerializerCompiler(serializerCompiler)
app.setValidatorCompiler(validatorCompiler)

app.register(fastifyCors)

app.setErrorHandler(errorHandler)

app.register(fastifySwagger, {
 openapi: {
   info: {
     title: 'Hamburgueria API',
     description: 'Fullstack application for controlling burger restaurant finances.',
     version: '1.0.0',
   },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      }
    }
  }
 },
 transform: jsonSchemaTransform,
});

app.register(fastifySwaggerUi, {
 routePrefix: '/docs',
})

app.register( fastifyJwt, {
 secret: env.JTW_SECRET,
})

app.register(createAccount)
app.register(authenticateWithPassword)
app.register(requestPasswordRecover)
app.register(resetPassword)

app.register(getProfile)

app.register(registerTransaction)
app.register(changeTransaction)
app.register(getAllTransactions)
app.register(getFinancialSummary)
app.register(deleteTransaction)

app.register(createCategory)
app.register(deleteCategory)
app.register(listCategories)
app.register(updatedCategory)

app.register(createCreditCard)
app.register(deleteCreditCard)
app.register(listCreditCards)
app.register(updatedCreditCard)
app.register(closeInvoiceRoute)
app.register(listInvoices)

app.register(createBankAccount)
app.register(deleteAccount)
app.register(getAllAccount)


app.listen({
 port: env.SERVER_PORT,
}).then(()=>{
 console.log('Server running')
})
