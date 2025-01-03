import 'dotenv/config'
import { z } from 'zod'


const envSchema = z.object({
 
 DATABASE_URL: z.string().url(),
 SERVER_PORT: z.coerce.number().default(3333),
 JTW_SECRET: z.string(),

})

const _env = envSchema.safeParse(process.env)

if( _env.success == false) {
 console.log('Invalid environment varíables')
 throw new Error('Invalid environment varíables')
}

export const env = _env.data