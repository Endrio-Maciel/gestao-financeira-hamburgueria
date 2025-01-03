import { AbilityBuilder } from "@casl/ability";
import { AppAbility } from ".";
import { Role } from "./roles";
import { User } from "./models/user";


type PermissionsByRole = (user: User, builder: AbilityBuilder<AppAbility>) => void

export const permissions: Record<Role, PermissionsByRole> = { 
  ADMIN(user, { can }) {
    can('manage', 'all');
  },
  MEMBER(user, { can, cannot }) {
    cannot(['update', 'delete', 'create'], 'transactions');
    cannot(['update', 'delete', 'create'], 'categories');
    cannot(['update', 'delete', 'create'], 'credit_cards');
    can('get', 'transactions');
    can('get', 'categories');
  },
  BILLING(user, { can }) {
    can('get', 'User');
    can(['create', 'update', 'delete', 'get'], 'transactions');
    can(['create', 'update', 'delete', 'get'], 'categories');
    can(['create', 'update', 'delete', 'get'], 'credit_cards');
    can('get', 'Billing');
  },
};
