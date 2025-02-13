import { Transactions } from "@prisma/client";
import { buildApp } from "../../app";
import request from "supertest";

describe("Get All Transactions", () => {
  let app: ReturnType<typeof buildApp>;

  beforeAll(async () => {
    app = buildApp()
    await app.ready() 
  });

  afterAll(async () => {
    await app.close() 
  })

  it("should retrieve all transactions", async () => {
    const response = await request(app.server)
      .get("/transactions")
      .set("Authorization", `Bearer mock_token`)
      .query({ page: 1, perPage: 10 });
  
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.transactions)).toBe(true)
    
    const transactions: Transactions[] = response.body.transactions
    transactions.forEach(transaction => {
      expect(transaction).toHaveProperty("id");
      expect(transaction).toHaveProperty("amount");
      expect(transaction).toHaveProperty("createdAt");
      expect(transaction).toHaveProperty("description");
    });
  });
});
