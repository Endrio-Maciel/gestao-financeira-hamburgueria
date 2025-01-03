"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usertSubject = void 0;
const zod_1 = require("zod");
exports.usertSubject = zod_1.z.tuple([
    zod_1.z.literal("get"),
    zod_1.z.literal("User"),
]);
