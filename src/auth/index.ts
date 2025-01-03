import { AbilityBuilder, CreateAbility, createMongoAbility, MongoAbility } from "@casl/ability";
import { z } from "zod";
import { permissions } from "./permissions";
import { User } from "./models/user";
import { billingSubject } from "./subjects/billing";
import { usertSubject } from "./subjects/user";

interface Subject {
  __typename?: string
  [key: string]: any
}

const appAbilitiesSchema = z.union([
  billingSubject,
  usertSubject,
  z.tuple([z.literal("manage"), z.literal("all")]),
  z.tuple([z.literal("create"), z.literal("transactions")]),
  z.tuple([z.literal("update"), z.literal("transactions")]),
  z.tuple([z.literal("delete"), z.literal("transactions")]),
  z.tuple([z.literal("get"), z.literal("transactions")]),
  z.tuple([z.literal("get"), z.literal("categories")]),
  z.tuple([z.literal("update"), z.literal("categories")]),
  z.tuple([z.literal("delete"), z.literal("categories")]),
  z.tuple([z.literal("create"), z.literal("categories")]),
  z.tuple([z.literal("get"), z.literal("credit_cards")]),
  z.tuple([z.literal("create"), z.literal("credit_cards")]),
  z.tuple([z.literal("update"), z.literal("credit_cards")]),
  z.tuple([z.literal("delete"), z.literal("credit_cards")]),
]);

type AppAbilities = z.infer<typeof appAbilitiesSchema>;

export type AppAbility = MongoAbility<AppAbilities>;
export const createAppAbility = createMongoAbility as CreateAbility<AppAbility>;

export function defineAbilityFor(user: User) {
  const builder = new AbilityBuilder(createAppAbility);

  if (typeof permissions[user.role] !== "function") {
    throw new Error(`Permissions for role ${user.role} not found.`);
  }

  permissions[user.role](user, builder);

  const ability = builder.build({
    detectSubjectType(subject: Subject) {
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
