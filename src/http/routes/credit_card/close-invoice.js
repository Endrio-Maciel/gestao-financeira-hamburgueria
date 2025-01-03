"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeInvoiceRoute = closeInvoiceRoute;
const zod_1 = require("zod");
const auth_1 = require("../../middlewares/auth");
const get_user_permissions_1 = require("../../../utils/get-user-permissions");
const unauthorized_error_1 = require("../_errors/unauthorized-error");
const credit_card_bills_1 = require("./utils/credit-card-bills");
const bad_request_error_1 = require("../_errors/bad-request-error");
async function closeInvoiceRoute(app) {
    app.withTypeProvider().register(auth_1.auth).get('/credit-cards/:id/close-invoice', {
        schema: {
            tags: ['credit-cards'],
            summary: 'Close the invoice for a credit card',
            security: [{ bearerAuth: [] }],
            params: zod_1.z.object({
                id: zod_1.z.string().uuid(),
            }),
            response: {
                200: zod_1.z.object({
                    id: zod_1.z.string().uuid(),
                    month: zod_1.z.number(),
                    year: zod_1.z.number(),
                    closingDate: zod_1.z.date(),
                    dueDate: zod_1.z.date(),
                    totalAmount: zod_1.z.number(),
                    creditCardId: zod_1.z.string(),
                }),
            },
        },
    }, async (request, reply) => {
        const userId = await request.getCurrentUserId();
        const role = await request.getUserRole(userId);
        const { cannot } = (0, get_user_permissions_1.getUserPermissions)(userId, role.name);
        if (cannot('update', 'credit_cards')) {
            throw new unauthorized_error_1.UnauthorizedError('You do not have permission to close the invoice');
        }
        const { id } = request.params;
        try {
            const invoice = await (0, credit_card_bills_1.closeInvoice)(id);
            return reply.status(200).send(invoice);
        }
        catch (error) {
            throw new bad_request_error_1.BadRequestError();
        }
    });
}
