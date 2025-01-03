import request from 'supertest'
import { app } from '../../http/server'
import { prisma } from '../../lib/prisma';
import { Prisma, RoleType } from '@prisma/client';
import { hash } from 'bcryptjs';
import { auth } from '../../http/middlewares/auth';

describe('Credit Card Routes', ()=>{
 
  let token: string
 
  beforeAll(async () => {
    await prisma.$connect();
    
    const roles = [
      { id: "ADMIN", name: RoleType.ADMIN },
      { id: "MEMBER", name: RoleType.MEMBER },
      { id: "BILLING", name: RoleType.BILLING },
    ];

    await prisma.role.createMany({
      data: roles,
      skipDuplicates: true, 
    });
    
    const adminRole = await prisma.role.findUniqueOrThrow({
        where: { id: RoleType.ADMIN },
      });

    const adminPassword = await hash('admin123', 6) 

     const adminUser = await prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: {},
      create: {
        name: 'Admin User',
        email: 'admin@example.com',
        passwordHash: adminPassword,
        roleId: adminRole.id,
      },
    });

    token = app.jwt.sign({ sub: adminUser.id });
  });
 
  afterAll(async () => {
    await prisma.$disconnect()
  })

  beforeEach(async ()=>{
    const tables = await prisma.$queryRaw<Array<{ tablename: string}>>(
     Prisma.sql`SELECT tablename FROM pg_tables WHERE schemaname='public'`
    )
    for (const { tablename } of tables ) {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${tablename}" CASCADE;`)
    }
    
  })

  it('should create a credit card', async ()=> {
    
  
    const response = await request(app.server)
   .post('/credit-cards/register')
   .set('Authorization', `Bearer ${token}`)
   .send({
    name: 'Cartão Teste',
    limit: 5000,
    closingDate: 15,
    dueDate: new Date().toISOString(),
    accountId: 'fake-account-id',
   })

   expect(response.status).toBe(201)
   expect(response.body).toHaveProperty('id');
   expect(response.body.name).toBe('Cartão Teste');
   expect(response.body.limit).toBe(5000);
 })


})