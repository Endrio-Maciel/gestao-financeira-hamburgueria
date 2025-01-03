"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.billingSubject = void 0;
const zod_1 = require("zod");
exports.billingSubject = zod_1.z.tuple([
    zod_1.z.union([zod_1.z.literal("create"), zod_1.z.literal("update"), zod_1.z.literal("delete"), zod_1.z.literal("get")]),
    zod_1.z.literal("Billing"),
]);
