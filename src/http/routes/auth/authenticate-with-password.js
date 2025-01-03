"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateWithPassword = authenticateWithPassword;
const zod_1 = require("zod");
const prisma_1 = require("../../../lib/prisma");
const bad_request_error_1 = require("../_errors/bad-request-error");
const bcryptjs_1 = require("bcryptjs");
async function authenticateWithPassword(app) {
    app.withTypeProvider().post('/sessions/password', {
        schema: {
            tags: ['auth'],
            summary: 'Authenticate with e-mail & password',
            body: zod_1.z.object({
                email: zod_1.z.string(),
                password: zod_1.z.string(),
            }),
            response: {
                201: zod_1.z.object({
                    token: zod_1.z.string(),
                })
            }
        },
    }, async (request, reply) => {
        const { email, password } = request.body;
        const userFromEmail = await prisma_1.prisma.user.findUnique({
            where: { email }
        });
        if (!userFromEmail) {
            throw new bad_request_error_1.BadRequestError('Invalid credentials.');
        }
        const isPasswordValid = await (0, bcryptjs_1.compare)(password, userFromEmail.passwordHash);
        if (!isPasswordValid) {
            throw new bad_request_error_1.BadRequestError('Invalid credentials.');
        }
        const token = await reply.jwtSign({
            sub: userFromEmail.id,
        }, {
            sign: {
                expiresIn: '7d',
            },
        });
        return reply.status(201).send({ token });
    });
}
