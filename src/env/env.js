"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
require("dotenv/config");
const zod_1 = require("zod");
const envSchema = zod_1.z.object({
    DATABASE_URL: zod_1.z.string().url(),
    SERVER_PORT: zod_1.z.coerce.number().default(3333),
    JTW_SECRET: zod_1.z.string(),
});
const _env = envSchema.safeParse(process.env);
if (_env.success == false) {
    console.log('Invalid environment varíables');
    throw new Error('Invalid environment varíables');
}
exports.env = _env.data;
