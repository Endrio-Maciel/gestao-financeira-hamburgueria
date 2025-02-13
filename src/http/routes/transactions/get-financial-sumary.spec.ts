import { FastifyInstance } from "fastify";
import fastify from "fastify";
import { getFinancialSummary } from "./get-financial-sumary";
import supertest from "supertest";
import { prisma } from "../../../lib/client"; 

jest.mock("../../../lib/client", () => ({
  prisma: {
    account: {
      aggregate: jest.fn(),
    },
    transactions: {
      aggregate: jest.fn(),
    },
  },
}));

describe("GET /transactions/summary", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = fastify();
    app.register(getFinancialSummary);

    app.addHook('preHandler', (request, reply, done) => {
      request.user = { id: 1 };
      done();
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it("should retrieve financial summary", async () => {
    (prisma.account.aggregate as jest.Mock).mockResolvedValue({ _sum: { balance: 1000 } });
    (prisma.transactions.aggregate as jest.Mock).mockResolvedValueOnce({ _sum: { amount: 500 } });
    (prisma.transactions.aggregate as jest.Mock).mockResolvedValueOnce({ _sum: { amount: 200 } });

    const response = await supertest(app.server)
      .get("/transactions/summary")
      .set("Authorization", `Bearer mock_token`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      currentBalance: 1000,
      futureExpenses: 500,
      futureIncomes: 200,
    });
  });

  it("should return zero for financial summary if no data is found", async () => {
    (prisma.account.aggregate as jest.Mock).mockResolvedValue({ _sum: { balance: 0 } });
    (prisma.transactions.aggregate as jest.Mock).mockResolvedValueOnce({ _sum: { amount: 0 } });
    (prisma.transactions.aggregate as jest.Mock).mockResolvedValueOnce({ _sum: { amount: 0 } });

    const response = await supertest(app.server)
      .get("/transactions/summary")
      .set("Authorization", `Bearer mock_token`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      currentBalance: 0,
      futureExpenses: 0,
      futureIncomes: 0,
    });
  });
});
