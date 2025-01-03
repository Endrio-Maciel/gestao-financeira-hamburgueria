import { FastifyInstance } from "fastify";
import fastifyPlugin from "fastify-plugin";
import { UnauthorizedError } from "../routes/_errors/unauthorized-error";
import { prisma } from "../../lib/prisma";
import { Role } from "@prisma/client";
import { BadRequestError } from "../routes/_errors/bad-request-error";

export const auth = fastifyPlugin(async (app: FastifyInstance) => {
  app.addHook('preHandler', async (request) =>{
   request.getCurrentUserId = async () => {
    try {
     const { sub } = await request.jwtVerify<{ sub: string }>()

      return sub
     
    } catch (error) {
     throw new UnauthorizedError('Invalid auth token.')
    }
   }

   request.getUserRole = async (userId: string): Promise<Role> => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          role: true,
        },
      })
      if(!user) {
        throw new BadRequestError("User not found.")
      }

      return user.role 

    } catch (error) {
      throw new UnauthorizedError('Role not found.')
    }
  
  }

  },)


}, )