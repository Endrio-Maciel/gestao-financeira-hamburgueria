"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma_1 = require("../lib/prisma");
beforeAll(async () => {
    await prisma_1.prisma.$connect();
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
