import { z } from 'zod'

export const usertSubject = z.tuple([
 z.literal("get"),
 z.literal("User"),
])

export type UsertSubject = z.infer<typeof usertSubject>