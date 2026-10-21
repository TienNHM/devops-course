import { test } from "node:test";
import assert from "node:assert/strict";
import { createApp, validateMember } from "../app.js";

// Mock pool: không cần database thật.
function makeMockPool(handler) {
  const calls = [];
  return {
    calls,
    async query(sql, params) {
      calls.push({ sql, params });
      return handler(sql, params);
    }
  };
}

async function withServer(pool, fn) {
  const app = createApp(pool);
  const server = await new Promise((resolve) => {
    const s = app.listen(0, "127.0.0.1", () => resolve(s));
  });
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    await fn(base);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

function json(method, body) {
  return {
    method,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  };
}

const uniqueViolation = () => Object.assign(new Error("duplicate"), { code: "23505" });

async function silenceErrors(fn) {
  const original = console.error;
  console.error = () => {};
  try {
    await fn();
  } finally {
    console.error = original;
  }
}

test("validateMember trims, lowercases email and rejects bad input", () => {
  assert.deepEqual(validateMember({ name: "  An ", email: " An@Example.COM " }).value, {
    name: "An",
    email: "an@example.com"
  });
  assert.ok(validateMember({}).errors.name);
  assert.ok(validateMember({ name: 1, email: "a@b.co" }).errors.name);
  assert.ok(validateMember({ name: "x".repeat(101), email: "a@b.co" }).errors.name);
  assert.ok(validateMember({ name: "a", email: "not-an-email" }).errors.email);
  assert.ok(validateMember({ name: "a", email: `${"x".repeat(150)}@b.co` }).errors.email);
  assert.ok(validateMember(null).errors.name);
});

test("GET /health does not touch the database", async () => {
  const pool = makeMockPool(() => assert.fail("should not query"));
  await withServer(pool, async (base) => {
    const res = await fetch(`${base}/health`);
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), { status: "healthy", service: "club-api" });
  });
});

test("GET /ready returns 200 or 503 depending on the database", async () => {
  await withServer(makeMockPool(() => ({ rows: [] })), async (base) => {
    assert.equal((await fetch(`${base}/ready`)).status, 200);
  });
  await withServer(
    makeMockPool(() => {
      throw new Error("down");
    }),
    async (base) => {
      const res = await fetch(`${base}/ready`);
      assert.equal(res.status, 503);
      assert.deepEqual(await res.json(), { status: "not-ready" });
    }
  );
});

test("GET /api/members lists members and maps DB errors to 500", async () => {
  const rows = [{ id: 1, name: "Alice", email: "alice@example.com" }];
  await withServer(makeMockPool(() => ({ rows })), async (base) => {
    const res = await fetch(`${base}/api/members`);
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), rows);
  });
  await silenceErrors(() =>
    withServer(
      makeMockPool(() => {
        throw new Error("boom");
      }),
      async (base) => {
        const res = await fetch(`${base}/api/members`);
        assert.equal(res.status, 500);
        assert.deepEqual(await res.json(), { message: "Internal server error" });
      }
    )
  );
});

test("GET /api/members/:id covers 200, 404 and 400", async () => {
  const pool = makeMockPool((sql, params) =>
    params[0] === 1
      ? { rowCount: 1, rows: [{ id: 1, name: "Alice", email: "alice@example.com" }] }
      : { rowCount: 0, rows: [] }
  );
  await withServer(pool, async (base) => {
    assert.equal((await fetch(`${base}/api/members/1`)).status, 200);
    assert.equal((await fetch(`${base}/api/members/2`)).status, 404);
    for (const bad of ["abc", "0", "-1", "1.5", "99999999999"]) {
      assert.equal((await fetch(`${base}/api/members/${bad}`)).status, 400, bad);
    }
  });
  // Chỉ id hợp lệ mới chạm tới database.
  assert.equal(pool.calls.length, 2);
});

test("POST /api/members returns 201 with parameterized query", async () => {
  const pool = makeMockPool((sql, params) => ({
    rowCount: 1,
    rows: [{ id: 7, name: params[0], email: params[1] }]
  }));
  await withServer(pool, async (base) => {
    const res = await fetch(
      `${base}/api/members`,
      json("POST", { name: " Carol ", email: "Carol@Example.com" })
    );
    assert.equal(res.status, 201);
    assert.equal(res.headers.get("location"), "/api/members/7");
    assert.deepEqual(await res.json(), { id: 7, name: "Carol", email: "carol@example.com" });
  });
  assert.match(pool.calls[0].sql, /VALUES \(\$1, \$2\)/);
  assert.deepEqual(pool.calls[0].params, ["Carol", "carol@example.com"]);
});

test("POST /api/members rejects invalid input with 400 and never queries", async () => {
  const pool = makeMockPool(() => assert.fail("should not query"));
  await withServer(pool, async (base) => {
    const res = await fetch(`${base}/api/members`, json("POST", { name: "", email: "x" }));
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.ok(body.errors.name);
    assert.ok(body.errors.email);

    const bad = await fetch(`${base}/api/members`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{not json"
    });
    assert.equal(bad.status, 400);
    assert.deepEqual(await bad.json(), { message: "Invalid JSON body" });

    const noBody = await fetch(`${base}/api/members`, { method: "POST" });
    assert.equal(noBody.status, 400);
  });
});

test("POST /api/members returns 409 on duplicate email and 500 on other errors", async () => {
  await withServer(
    makeMockPool(() => {
      throw uniqueViolation();
    }),
    async (base) => {
      const res = await fetch(
        `${base}/api/members`,
        json("POST", { name: "A", email: "a@example.com" })
      );
      assert.equal(res.status, 409);
      assert.deepEqual(await res.json(), { message: "Email already exists" });
    }
  );
  await silenceErrors(() =>
    withServer(
      makeMockPool(() => {
        throw new Error("connection lost");
      }),
      async (base) => {
        const res = await fetch(
          `${base}/api/members`,
          json("POST", { name: "A", email: "a@example.com" })
        );
        assert.equal(res.status, 500);
      }
    )
  );
});

test("PUT /api/members/:id covers 200, 400, 404 and 409", async () => {
  const ok = makeMockPool((sql, params) => ({
    rowCount: 1,
    rows: [{ id: params[2], name: params[0], email: params[1] }]
  }));
  await withServer(ok, async (base) => {
    const res = await fetch(
      `${base}/api/members/3`,
      json("PUT", { name: "New", email: "new@example.com" })
    );
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), { id: 3, name: "New", email: "new@example.com" });

    const badId = await fetch(
      `${base}/api/members/abc`,
      json("PUT", { name: "N", email: "n@example.com" })
    );
    assert.equal(badId.status, 400);
    const missing = await fetch(`${base}/api/members/3`, json("PUT", { name: "N" }));
    assert.equal(missing.status, 400);
  });

  await withServer(makeMockPool(() => ({ rowCount: 0, rows: [] })), async (base) => {
    const res = await fetch(
      `${base}/api/members/99`,
      json("PUT", { name: "N", email: "n@example.com" })
    );
    assert.equal(res.status, 404);
  });

  await withServer(
    makeMockPool(() => {
      throw uniqueViolation();
    }),
    async (base) => {
      const res = await fetch(
        `${base}/api/members/1`,
        json("PUT", { name: "N", email: "dup@example.com" })
      );
      assert.equal(res.status, 409);
    }
  );
});

test("DELETE /api/members/:id covers 204, 404 and 400", async () => {
  const pool = makeMockPool((sql, params) => ({ rowCount: params[0] === 1 ? 1 : 0 }));
  await withServer(pool, async (base) => {
    const ok = await fetch(`${base}/api/members/1`, { method: "DELETE" });
    assert.equal(ok.status, 204);
    assert.equal(await ok.text(), "");
    assert.equal((await fetch(`${base}/api/members/2`, { method: "DELETE" })).status, 404);
    assert.equal((await fetch(`${base}/api/members/x`, { method: "DELETE" })).status, 400);
  });
});

test("unknown routes return 404 JSON", async () => {
  await withServer(makeMockPool(() => ({ rows: [] })), async (base) => {
    const res = await fetch(`${base}/nope`);
    assert.equal(res.status, 404);
    assert.deepEqual(await res.json(), { message: "Not found" });
  });
});
