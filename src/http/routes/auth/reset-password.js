"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = resetPassword;
const zod_1 = require("zod");
const prisma_1 = require("../../../lib/prisma");
const bcryptjs_1 = require("bcryptjs");
const unauthorized_error_1 = require("../_errors/unauthorized-error");
async function resetPassword(app) {
    app.withTypeProvider().post('/password/reset', {
        schema: {
            tags: ['auth'],
            summary: 'Reset user password.',
            body: zod_1.z.object({
                code: zod_1.z.string(),
                password: zod_1.z.string(),
            }),
            response: {
                201: zod_1.z.null()
            },
        },
    }, async (request, reply) => {
        const { code, password } = request.body;
        const tokenFromCode = await prisma_1.prisma.token.findUnique({
            where: { token: code },
            include: { user: true },
        });
        if (!tokenFromCode || tokenFromCode.type !== "PASSWORD_RECOVER") {
            throw new unauthorized_error_1.UnauthorizedError();
        }
        if (new Date() > tokenFromCode.expiresAt) {
            throw new unauthorized_error_1.UnauthorizedError('Token expired');
        }
        const passwordHash = await (0, bcryptjs_1.hash)(password, 6);
        await prisma_1.prisma.$transaction([
            prisma_1.prisma.user.update({
                where: {
                    id: tokenFromCode.userId
                },
                data: {
                    passwordHash,
                },
            }),
            prisma_1.prisma.token.delete({
                where: {
                    id: tokenFromCode.id
                },
            })
        ]);
        return reply.status(204).send();
    });
}
