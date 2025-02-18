import { z } from 'zod'

export const billingSubject = z.tuple([
 z.union([z.literal("create"), z.literal("update"), z.literal("delete"), z.literal("get")]),
 z.literal("Billing"),
]);

export type BillingSubject = z.infer<typeof billingSubject>