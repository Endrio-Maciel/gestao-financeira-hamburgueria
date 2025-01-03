"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfile = getProfile;
const zod_1 = require("zod");
const prisma_1 = require("../../../lib/prisma");
const bad_request_error_1 = require("../_errors/bad-request-error");
const auth_1 = require("../../middlewares/auth");
async function getProfile(app) {
    app.withTypeProvider().register(auth_1.auth).get('/profile', {
        schema: {
            tags: ['users'],
            summary: 'Get my profile',
            security: [{ bearerAuth: [] }],
            response: {
                200: zod_1.z.object({
                    user: zod_1.z.object({
                        id: zod_1.z.string().uuid(),
                        name: zod_1.z.string().nullable(),
                        email: zod_1.z.string().email(),
                    })
                })
            },
        },
    }, async (request, reply) => {
        const userId = await request.getCurrentUserId();
        const user = await prisma_1.prisma.user.findUnique({
            select: {
                id: true,
                name: true,
                email: true,
            },
            where: {
                id: userId,
            }
        });
        if (!user) {
            throw new bad_request_error_1.BadRequestError('User not found.');
        }
        return reply.status(200).send({ user });
    });
}
