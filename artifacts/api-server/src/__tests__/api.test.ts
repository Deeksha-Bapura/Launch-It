/**
 * API tests with Supertest. Needs a real (empty) Postgres in DATABASE_URL.
 * In GitHub Actions the workflow provides one.
 *
 * Requires `app` to be exported WITHOUT calling app.listen().
 * If src/index.ts does both, split it: src/app.ts exports the Express app,
 * src/index.ts imports it and calls listen().
 */
import { describe, it, expect } from "@jest/globals";
import request from "supertest";
import app from "../app"; // TODO: adjust path / named vs default export

// TODO: adjust route paths and field names to match your OpenAPI spec.
const SIGNUP = "/api/auth/signup";
const LOGIN = "/api/auth/login";
const LOGOUT = "/api/auth/logout";
const ME = "/api/auth/me";
const TX = "/api/transactions";

const unique = () => `test_${Date.now()}_${Math.random().toString(36).slice(2, 7)}@example.com`;

async function newUser() {
  const agent = request.agent(app); // keeps the session cookie between calls
  const email = unique();
  const password = "testpass123";
  const res = await agent.post(SIGNUP).send({ email, password, name: "Test User" });
  expect([200, 201]).toContain(res.status);
  return { agent, email, password };
}

describe("auth", () => {
  it("signs up and sets an httpOnly session cookie", async () => {
    const res = await request(app).post(SIGNUP).send({ email: unique(), password: "testpass123", name: "A" });
    expect([200, 201]).toContain(res.status);
    const cookie = String(res.headers["set-cookie"] ?? "");
    expect(cookie).toMatch(/httponly/i);
  });

  it("rejects a duplicate email", async () => {
    const { email } = await newUser();
    const res = await request(app).post(SIGNUP).send({ email, password: "testpass123", name: "B" });
    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  it("rejects a password shorter than 6 characters", async () => {
    const res = await request(app).post(SIGNUP).send({ email: unique(), password: "123", name: "C" });
    expect(res.status).toBe(400);
  });

  it("rejects a wrong password", async () => {
    const { email } = await newUser();
    const res = await request(app).post(LOGIN).send({ email, password: "wrongpass" });
    expect(res.status).toBe(401);
  });

  it("logs in, then logout ends the session", async () => {
    const { agent } = await newUser();
    expect((await agent.get(ME)).status).toBe(200);
    await agent.post(LOGOUT);
    expect((await agent.get(ME)).status).toBe(401);
  });

  it("blocks protected routes without a session", async () => {
    expect((await request(app).get(TX)).status).toBe(401);
  });
});

describe("transactions", () => {
  it("creates and lists a transaction", async () => {
    const { agent } = await newUser();
    const create = await agent.post(TX).send({
      type: "income", amount: 45, category: "Sales", description: "Cake order", date: "2026-10-01",
    });
    expect([200, 201]).toContain(create.status);

    const list = await agent.get(TX);
    expect(list.status).toBe(200);
    expect(list.body).toHaveLength(1);
    expect(list.body[0].description).toBe("Cake order");
  });

  it("rejects invalid input", async () => {
    const { agent } = await newUser();
    const res = await agent.post(TX).send({ type: "income", amount: "not a number" });
    expect(res.status).toBe(400);
  });
});

describe("data isolation (each user sees only their own data)", () => {
  it("user B cannot see, edit or delete user A's transactions", async () => {
    const a = await newUser();
    const b = await newUser();

    const created = await a.agent.post(TX).send({
      type: "expense", amount: 20, category: "Supplies", description: "A's flour", date: "2026-10-02",
    });
    const id = created.body.id;

    // B's list must not contain A's row
    const bList = await b.agent.get(TX);
    expect(bList.body.find((t: { id: unknown }) => t.id === id)).toBeUndefined();

    // B can't read, change or delete it by id (404 is better than 403: it doesn't leak that the id exists)
    // TODO: delete any of these three if you don't have that route
    expect([403, 404]).toContain((await b.agent.get(`${TX}/${id}`)).status);
    expect([403, 404]).toContain((await b.agent.put(`${TX}/${id}`).send({ amount: 1 })).status);
    expect([403, 404]).toContain((await b.agent.delete(`${TX}/${id}`)).status);

    // A's row is untouched
    const aList = await a.agent.get(TX);
    expect(aList.body.find((t: { id: unknown }) => t.id === id).amount).toEqual(20);
  });

  // TODO: copy the test above for /api/documents, /api/compliance and /api/conversations
});
