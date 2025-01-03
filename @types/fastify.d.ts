import { Role } from '@prisma/client'
import 'fastify'

declare module 'fastify' {
  export interface FastifyRequest {
   getCurrentUserId(): Promise<string>
   getUserRole(userId: string): Promise<Role>
  }
}