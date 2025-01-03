"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userSchema = void 0;
const zod_1 = require("zod");
const roles_1 = require("../roles");
exports.userSchema = zod_1.z.object({
    id: zod_1.z.string(),
    role: roles_1.roleSchema,
});
