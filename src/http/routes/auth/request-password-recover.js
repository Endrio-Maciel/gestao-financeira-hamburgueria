"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestPasswordRecover = requestPasswordRecover;
const zod_1 = require("zod");
const node_crypto_1 = require("node:crypto");
const prisma_1 = require("../../../lib/prisma");
const date_fns_1 = require("date-fns");
async function requestPasswordRecover(app) {
    app.withTypeProvider().post('/password/recover', {
        schema: {
            tags: ['auth'],
            summary: 'get lost user password',
            body: zod_1.z.object({
                email: zod_1.z.string(),
            }),
            response: {
                201: zod_1.z.object({
                    token: zod_1.z.string(),
                })
            }
        },
    }, async (request, reply) => {
        const { email } = request.body;
        const userFromEmail = await prisma_1.prisma.user.findUnique({
            where: { email }
        });
        if (!userFromEmail) {
            return reply.status(201).send();
        }
        await prisma_1.prisma.token.deleteMany({
            where: {
                userId: userFromEmail.id,
                type: "PASSWORD_RECOVER",
            }
        });
        const tokenValue = (0, node_crypto_1.randomUUID)();
        const expiresAt = (0, date_fns_1.addHours)(new Date(), 1);
        const { token } = await prisma_1.prisma.token.create({
            data: {
                type: "PASSWORD_RECOVER",
                token: tokenValue,
                userId: userFromEmail.id,
                expiresAt,
            },
        });
        console.log('Recover password token: ', token);
        return reply.status(201).send({ token });
    });
}
