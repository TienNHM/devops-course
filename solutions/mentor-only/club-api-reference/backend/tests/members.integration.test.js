import { test } from "node:test";
import assert from "node:assert/strict";
import { app } from "../app.js";
import { pool } from "../db.js";

// Chỉ chạy khi có database thật (CI dùng service container postgres).
// Chạy local: RUN_INTEGRATION=1 DB_HOST=localhost DB_PASSWORD=... npm test
const enabled = Boolean(process.env.RUN_INTEGRATION);
const suffix = `${Date.now()}`;
const email = `it-${suffix}@example.com`;

function json(method, body) {
  return {
    method,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  };
}

test("members CRUD against a real PostgreSQL", { skip: !enabled }, async (t) => {
  await pool.query(
    `CREATE TABLE IF NOT EXISTS members (
       id SERIAL PRIMARY KEY,
       name VARCHAR(100) NOT NULL,
       email VARCHAR(150) UNIQUE NOT NULL,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
     )`
  );
  const server = await new Promise((resolve) => {
    const s = app.listen(0, "127.0.0.1", () => resolve(s));
  });
  const base = `http://127.0.0.1:${server.address().port}`;
  let id;

  t.after(async () => {
    await pool.query("DELETE FROM members WHERE email LIKE $1", [`it-${suffix}%`]);
    await new Promise((resolve) => server.close(resolve));
  });

  await t.test("ready when the database is reachable", async () => {
    assert.equal((await fetch(`${base}/ready`)).status, 200);
  });

  await t.test("create returns 201 and a generated id", async () => {
    const res = await fetch(`${base}/api/members`, json("POST", { name: "IT User", email }));
    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.email, email);
    id = body.id;
    assert.ok(Number.isInteger(id));
  });

  await t.test("duplicate email returns 409", async () => {
    const res = await fetch(`${base}/api/members`, json("POST", { name: "Dup", email }));
    assert.equal(res.status, 409);
  });

  await t.test("read, update and delete", async () => {
    assert.equal((await fetch(`${base}/api/members/${id}`)).status, 200);

    const updated = await fetch(
      `${base}/api/members/${id}`,
      json("PUT", { name: "IT Renamed", email })
    );
    assert.equal(updated.status, 200);
    assert.equal((await updated.json()).name, "IT Renamed");

    assert.equal((await fetch(`${base}/api/members/${id}`, { method: "DELETE" })).status, 204);
    assert.equal((await fetch(`${base}/api/members/${id}`)).status, 404);
  });
});

test.after(async () => {
  await pool.end();
});
