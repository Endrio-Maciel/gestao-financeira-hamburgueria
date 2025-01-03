"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserPermissions = getUserPermissions;
const auth_1 = require("../auth");
const user_1 = require("../auth/models/user");
function getUserPermissions(userId, roleName) {
    const authUser = user_1.userSchema.parse({
        id: userId,
        role: roleName,
    });
    const ability = (0, auth_1.defineAbilityFor)(authUser);
    return ability;
}
