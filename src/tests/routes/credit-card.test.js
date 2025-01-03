"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const server_1 = require("../../http/server");
const prisma_1 = require("../../lib/prisma");
const client_1 = require("@prisma/client");
const bcryptjs_1 = require("bcryptjs");
describe('Credit Card Routes', () => {
    let token;
    beforeAll(async () => {
        await prisma_1.prisma.$connect();
        const roles = [
            { id: "ADMIN", name: client_1.RoleType.ADMIN },
            { id: "MEMBER", name: client_1.RoleType.MEMBER },
            { id: "BILLING", name: client_1.RoleType.BILLING },
        ];
        await prisma_1.prisma.role.createMany({
            data: roles,
            skipDuplicates: true,
        });
        const adminRole = await prisma_1.prisma.role.findUniqueOrThrow({
            where: { id: client_1.RoleType.ADMIN },
        });
        const adminPassword = await (0, bcryptjs_1.hash)('admin123', 6);
        const adminUser = await prisma_1.prisma.user.upsert({
            where: { email: 'admin@example.com' },
            update: {},
            create: {
                name: 'Admin User',
                email: 'admin@example.com',
                passwordHash: adminPassword,
                roleId: adminRole.id,
            },
        });
        token = server_1.app.jwt.sign({ sub: adminUser.id });
    });
    afterAll(async () => {
        await prisma_1.prisma.$disconnect();
    });
    beforeEach(async () => {
        const tables = await prisma_1.prisma.$queryRaw(client_1.Prisma.sql `SELECT tablename FROM pg_tables WHERE schemaname='public'`);
        for (const { tablename } of tables) {
            await prisma_1.prisma.$executeRawUnsafe(`TRUNCATE TABLE "${tablename}" CASCADE;`);
        }
    });
    it('should create a credit card', async () => {
        const response = await (0, supertest_1.default)(server_1.app.server)
            .post('/credit-cards/register')
            .set('Authorization', `Bearer ${token}`)
            .send({
            name: 'Cartão Teste',
            limit: 5000,
            closingDate: 15,
            dueDate: new Date().toISOString(),
            accountId: 'fake-account-id',
        });
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('id');
        expect(response.body.name).toBe('Cartão Teste');
        expect(response.body.limit).toBe(5000);
    });
});
