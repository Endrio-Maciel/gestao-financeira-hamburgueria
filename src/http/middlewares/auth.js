"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = void 0;
const fastify_plugin_1 = __importDefault(require("fastify-plugin"));
const unauthorized_error_1 = require("../routes/_errors/unauthorized-error");
const prisma_1 = require("../../lib/prisma");
const bad_request_error_1 = require("../routes/_errors/bad-request-error");
exports.auth = (0, fastify_plugin_1.default)(async (app) => {
    app.addHook('preHandler', async (request) => {
        request.getCurrentUserId = async () => {
            try {
                const { sub } = await request.jwtVerify();
                return sub;
            }
            catch (error) {
                throw new unauthorized_error_1.UnauthorizedError('Invalid auth token.');
            }
        };
        request.getUserRole = async (userId) => {
            try {
                const user = await prisma_1.prisma.user.findUnique({
                    where: { id: userId },
                    select: {
                        role: true,
                    },
                });
                if (!user) {
                    throw new bad_request_error_1.BadRequestError("User not found.");
                }
                return user.role;
            }
            catch (error) {
                throw new unauthorized_error_1.UnauthorizedError('Role not found.');
            }
        };
    });
});
