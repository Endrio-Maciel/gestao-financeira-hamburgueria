"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAccount = createAccount;
const zod_1 = require("zod");
const prisma_1 = require("../../../lib/prisma");
const bad_request_error_1 = require("../_errors/bad-request-error");
const bcryptjs_1 = require("bcryptjs");
const client_1 = require("@prisma/client");
async function createAccount(app) {
    app.withTypeProvider().post('/users/create', {
        schema: {
            tags: ['auth'],
            summary: 'Create a new account',
            body: zod_1.z.object({
                name: zod_1.z.string(),
                email: zod_1.z.string(),
                password: zod_1.z.string().min(6)
            }),
            response: {
                201: zod_1.z.null()
            }
        },
    }, async (request, reply) => {
        const { name, email, password } = request.body;
        const userWithSameEmail = await prisma_1.prisma.user.findUnique({
            where: { email }
        });
        if (userWithSameEmail) {
            throw new bad_request_error_1.BadRequestError('User with same e-mail alredy exists.');
        }
        const passwordHash = await (0, bcryptjs_1.hash)(password, 6);
        const role = await prisma_1.prisma.role.create({
            data: {
                name: client_1.RoleType.MEMBER,
            }
        });
        await prisma_1.prisma.user.create({
            data: {
                name,
                email,
                passwordHash,
                roleId: role.id
            }
        });
        return reply.status(201).send();
    });
}
