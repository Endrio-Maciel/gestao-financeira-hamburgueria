"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.permissions = void 0;
exports.permissions = {
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
