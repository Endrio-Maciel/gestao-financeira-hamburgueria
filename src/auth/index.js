"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAppAbility = void 0;
exports.defineAbilityFor = defineAbilityFor;
const ability_1 = require("@casl/ability");
const zod_1 = require("zod");
const permissions_1 = require("./permissions");
const billing_1 = require("./subjects/billing");
const user_1 = require("./subjects/user");
const appAbilitiesSchema = zod_1.z.union([
    billing_1.billingSubject,
    user_1.usertSubject,
    zod_1.z.tuple([zod_1.z.literal("manage"), zod_1.z.literal("all")]),
    zod_1.z.tuple([zod_1.z.literal("create"), zod_1.z.literal("transactions")]),
    zod_1.z.tuple([zod_1.z.literal("update"), zod_1.z.literal("transactions")]),
    zod_1.z.tuple([zod_1.z.literal("delete"), zod_1.z.literal("transactions")]),
    zod_1.z.tuple([zod_1.z.literal("get"), zod_1.z.literal("transactions")]),
    zod_1.z.tuple([zod_1.z.literal("get"), zod_1.z.literal("categories")]),
    zod_1.z.tuple([zod_1.z.literal("update"), zod_1.z.literal("categories")]),
    zod_1.z.tuple([zod_1.z.literal("delete"), zod_1.z.literal("categories")]),
    zod_1.z.tuple([zod_1.z.literal("create"), zod_1.z.literal("categories")]),
    zod_1.z.tuple([zod_1.z.literal("get"), zod_1.z.literal("credit_cards")]),
    zod_1.z.tuple([zod_1.z.literal("create"), zod_1.z.literal("credit_cards")]),
    zod_1.z.tuple([zod_1.z.literal("update"), zod_1.z.literal("credit_cards")]),
    zod_1.z.tuple([zod_1.z.literal("delete"), zod_1.z.literal("credit_cards")]),
]);
exports.createAppAbility = ability_1.createMongoAbility;
function defineAbilityFor(user) {
    const builder = new ability_1.AbilityBuilder(exports.createAppAbility);
    if (typeof permissions_1.permissions[user.role] !== "function") {
        throw new Error(`Permissions for role ${user.role} not found.`);
    }
    permissions_1.permissions[user.role](user, builder);
    const ability = builder.build({
        detectSubjectType(subject) {
            if (subject && subject.__typename) {
                return subject.__typename;
            }
            if (subject && subject.type) {
                return subject.type;
            }
            return undefined;
        },
    });
    ability.can = ability.can.bind(ability);
    ability.cannot = ability.cannot.bind(ability);
    return ability;
}
