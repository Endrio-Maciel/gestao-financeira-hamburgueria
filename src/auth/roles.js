"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roleSchema = void 0;
const zod_1 = require("zod");
exports.roleSchema = zod_1.z.union([
    zod_1.z.literal('ADMIN'),
    zod_1.z.literal('MEMBER'),
    zod_1.z.literal('BILLING'),
]);
