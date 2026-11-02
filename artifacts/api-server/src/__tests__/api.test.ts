import { describe, it, expect, afterAll } from "@jest/globals";
import request from "supertest";
import app from "../app";
import { pool } from "@workspace/db";

const REGISTER = "/api/auth/register";
const LOGIN = "/api/auth/login";
const LOGOUT = "/api/auth/logout";
const ME = "/api/auth/me";
const TX = "/api/transactions";
const PASSWORD = "testpass123";

type Agent = ReturnType<typeof request.agent>;

const uniqueEmail = () =>
  `test_${Date.now()}_${Math.random().toString(36).slice(2, 8)}@example.com`;

// Creates a new user and returns a browser-like "agent" that stays logged in
async function newUser() {
  const agent = request.agent(app);
  const email = uniqueEmail();
  const res = await agent.post(REGISTER).send({ email, password: PASSWORD, name: "Test User" });
  expect(res.status).toBe(201);
  return { agent, email };
}

function addTx(agent: Agent, overrides: Record<string, unknown> = {}) {
  return agent.post(TX).send({
    type: "income",
    amount: 45,
    description: "Cake order",
    category: "Sales",
    date: "2026-10-01",
    ...overrides,
  });
}

// Close the database connection so Jest can exit cleanly
afterAll(async () => {
  await pool.end();
});

describe("auth", () => {
  it("registers a user, sets an httpOnly cookie, and never returns the password hash", async () => {
    const res = await request(app)
      .post(REGISTER)
      .send({ email: uniqueEmail(), password: PASSWORD, name: "A" });
    expect(res.status).toBe(201);
    expect(String(res.headers["set-cookie"])).toMatch(/httponly/i);
    expect(res.body.user.email).toBeDefined();
    expect(res.body.user.passwordHash).toBeUndefined();
  });

  it("rejects a duplicate email, even in different capitals", async () => {
    const { email } = await newUser();
    const res = await request(app)
      .post(REGISTER)
      .send({ email: email.toUpperCase(), password: PASSWORD, name: "B" });
    expect(res.status).toBe(409);
  });

  it("rejects a password shorter than 6 characters", async () => {
    const res = await request(app)
      .post(REGISTER)
      .send({ email: uniqueEmail(), password: "123", name: "C" });
    expect(res.status).toBe(400);
  });

  it("logs in with the right password and rejects the wrong one", async () => {
    const { email } = await newUser();
    const bad = await request(app).post(LOGIN).send({ email, password: "wrongpass" });
    expect(bad.status).toBe(401);
    const good = await request(app).post(LOGIN).send({ email, password: PASSWORD });
    expect(good.status).toBe(200);
    expect(good.body.user.email).toBe(email);
  });

  it("logout ends the session", async () => {
    const { agent } = await newUser();
    expect((await agent.get(ME)).status).toBe(200);
    await agent.post(LOGOUT);
    expect((await agent.get(ME)).status).toBe(401);
  });

  it("returns 401 for /me without a session", async () => {
    expect((await request(app).get(ME)).status).toBe(401);
  });
});

describe("transactions", () => {
  it("blocks access without a session", async () => {
    expect((await request(app).get(TX)).status).toBe(401);
    expect((await addTx(request.agent(app))).status).toBe(401);
  });

  it("creates and lists a transaction", async () => {
    const { agent } = await newUser();
    const create = await addTx(agent);
    expect(create.status).toBe(201);

    const list = await agent.get(TX);
    expect(list.status).toBe(200);
    expect(list.body.transactions).toHaveLength(1);
    expect(list.body.transactions[0].description).toBe("Cake order");
    expect(Number(list.body.transactions[0].amount)).toBe(45);
  });

  it("rejects invalid data", async () => {
    const { agent } = await newUser();
    expect((await addTx(agent, { amount: "not a number" })).status).toBe(400);
  });

  it("filters by type and by month", async () => {
    const { agent } = await newUser();
    await addTx(agent, { type: "income", date: "2026-10-05" });
    await addTx(agent, { type: "expense", date: "2026-10-06" });
    await addTx(agent, { type: "income", date: "2026-11-01" });

    const expenses = await agent.get(`${TX}?type=expense`);
    expect(expenses.body.transactions).toHaveLength(1);

    const october = await agent.get(`${TX}?month=2026-10`);
    expect(october.body.transactions).toHaveLength(2);
  });

  it("deletes a transaction", async () => {
    const { agent } = await newUser();
    const id = (await addTx(agent)).body.transaction.id;
    expect((await agent.delete(`${TX}/${id}`)).status).toBe(200);
    expect((await agent.get(TX)).body.transactions).toHaveLength(0);
  });
});

describe("data isolation: each user only sees their own data", () => {
  it("user B cannot see user A's transactions", async () => {
    const a = await newUser();
    const b = await newUser();
    await addTx(a.agent, { description: "A's private order" });

    const bList = await b.agent.get(TX);
    expect(bList.body.transactions).toHaveLength(0);
  });

  it("user B cannot delete user A's transaction", async () => {
    const a = await newUser();
    const b = await newUser();
    const id = (await addTx(a.agent)).body.transaction.id;

    await b.agent.delete(`${TX}/${id}`);

    const aList = await a.agent.get(TX);
    expect(aList.body.transactions).toHaveLength(1);
  });
});