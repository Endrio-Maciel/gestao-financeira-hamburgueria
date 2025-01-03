"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const fastify_1 = __importDefault(require("fastify"));
const env_1 = require("../env/env");
const jwt_1 = __importDefault(require("@fastify/jwt"));
const swagger_1 = __importDefault(require("@fastify/swagger"));
const fastify_type_provider_zod_1 = require("fastify-type-provider-zod");
const cors_1 = __importDefault(require("@fastify/cors"));
const swagger_ui_1 = __importDefault(require("@fastify/swagger-ui"));
const error_handler_1 = require("./error-handler");
const authenticate_with_password_1 = require("./routes/auth/authenticate-with-password");
const request_password_recover_1 = require("./routes/auth/request-password-recover");
const reset_password_1 = require("./routes/auth/reset-password");
const get_my_profile_1 = require("./routes/users/get-my-profile");
const register_transaction_1 = require("./routes/transactions/register-transaction");
const change_transaction_1 = require("./routes/transactions/change-transaction");
const get_transactions_1 = require("./routes/transactions/get-transactions");
const delete_transaction_1 = require("./routes/transactions/delete-transaction");
const create_category_1 = require("./routes/categories/create-category");
const delete_category_1 = require("./routes/categories/delete-category");
const list_categories_1 = require("./routes/categories/list-categories");
const updated_category_1 = require("./routes/categories/updated-category");
const get_financial_sumary_1 = require("./routes/transactions/get-financial-sumary");
const create_card_1 = require("./routes/credit_card/create-card");
const delete_card_1 = require("./routes/credit_card/delete-card");
const list_cards_1 = require("./routes/credit_card/list-cards");
const updated_card_1 = require("./routes/credit_card/updated-card");
const close_invoice_1 = require("./routes/credit_card/close-invoice");
const list_invoices_1 = require("./routes/credit_card/list-invoices");
const delete_account_1 = require("./routes/bank_account/delete-account");
const get_all_accounts_1 = require("./routes/bank_account/get-all-accounts");
const create_bank_account_1 = require("./routes/bank_account/create-bank-account");
const create_account_1 = require("./routes/auth/create-account");
exports.app = (0, fastify_1.default)().withTypeProvider();
exports.app.setSerializerCompiler(fastify_type_provider_zod_1.serializerCompiler);
exports.app.setValidatorCompiler(fastify_type_provider_zod_1.validatorCompiler);
exports.app.register(cors_1.default);
exports.app.setErrorHandler(error_handler_1.errorHandler);
exports.app.register(swagger_1.default, {
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
    transform: fastify_type_provider_zod_1.jsonSchemaTransform,
});
exports.app.register(swagger_ui_1.default, {
    routePrefix: '/docs',
});
exports.app.register(jwt_1.default, {
    secret: env_1.env.JTW_SECRET,
});
exports.app.register(create_account_1.createAccount);
exports.app.register(authenticate_with_password_1.authenticateWithPassword);
exports.app.register(request_password_recover_1.requestPasswordRecover);
exports.app.register(reset_password_1.resetPassword);
exports.app.register(get_my_profile_1.getProfile);
exports.app.register(register_transaction_1.registerTransaction);
exports.app.register(change_transaction_1.changeTransaction);
exports.app.register(get_transactions_1.getAllTransactions);
exports.app.register(get_financial_sumary_1.getFinancialSummary);
exports.app.register(delete_transaction_1.deleteTransaction);
exports.app.register(create_category_1.createCategory);
exports.app.register(delete_category_1.deleteCategory);
exports.app.register(list_categories_1.listCategories);
exports.app.register(updated_category_1.updatedCategory);
exports.app.register(create_card_1.createCreditCard);
exports.app.register(delete_card_1.deleteCreditCard);
exports.app.register(list_cards_1.listCreditCards);
exports.app.register(updated_card_1.updatedCreditCard);
exports.app.register(close_invoice_1.closeInvoiceRoute);
exports.app.register(list_invoices_1.listInvoices);
exports.app.register(create_bank_account_1.createBankAccount);
exports.app.register(delete_account_1.deleteAccount);
exports.app.register(get_all_accounts_1.getAllAccount);
exports.app.listen({
    port: env_1.env.SERVER_PORT,
}).then(() => {
    console.log('Server running');
});
