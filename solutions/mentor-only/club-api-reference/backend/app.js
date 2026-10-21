import express from "express";
import { pool as defaultPool } from "./db.js";

const PG_UNIQUE_VIOLATION = "23505";
const MAX_INT4 = 2147483647;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Trả về { value } nếu hợp lệ, hoặc { errors } nếu không.
export function validateMember(body) {
  const errors = {};
  const input = body !== null && typeof body === "object" ? body : {};

  let name = input.name;
  if (typeof name !== "string" || name.trim() === "") {
    errors.name = "name is required";
  } else {
    name = name.trim();
    if (name.length > 100) errors.name = "name must be at most 100 characters";
  }

  let email = input.email;
  if (typeof email !== "string" || email.trim() === "") {
    errors.email = "email is required";
  } else {
    email = email.trim().toLowerCase();
    if (email.length > 150) {
      errors.email = "email must be at most 150 characters";
    } else if (!EMAIL_PATTERN.test(email)) {
      errors.email = "email is not valid";
    }
  }

  if (Object.keys(errors).length > 0) return { errors };
  return { value: { name, email } };
}

function parseId(raw) {
  if (!/^\d+$/.test(raw)) return null;
  const id = Number(raw);
  if (!Number.isSafeInteger(id) || id < 1 || id > MAX_INT4) return null;
  return id;
}

export function createApp(pool = defaultPool) {
  const app = express();
  app.disable("x-powered-by");
  app.use(express.json({ limit: "10kb" }));

  app.get("/health", (req, res) => {
    res.json({ status: "healthy", service: "club-api" });
  });

  app.get("/ready", async (req, res) => {
    try {
      await pool.query("SELECT 1");
      res.json({ status: "ready" });
    } catch {
      res.status(503).json({ status: "not-ready" });
    }
  });

  app.get("/api/members", async (req, res) => {
    const result = await pool.query(
      "SELECT id, name, email FROM members ORDER BY id"
    );
    res.json(result.rows);
  });

  app.get("/api/members/:id", async (req, res) => {
    const id = parseId(req.params.id);
    if (id === null) return res.status(400).json({ message: "Invalid id" });
    const result = await pool.query(
      "SELECT id, name, email FROM members WHERE id = $1",
      [id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Member not found" });
    }
    res.json(result.rows[0]);
  });

  app.post("/api/members", async (req, res) => {
    const { value, errors } = validateMember(req.body);
    if (errors) return res.status(400).json({ message: "Validation failed", errors });
    try {
      const result = await pool.query(
        "INSERT INTO members (name, email) VALUES ($1, $2) RETURNING id, name, email",
        [value.name, value.email]
      );
      res.status(201).location(`/api/members/${result.rows[0].id}`).json(result.rows[0]);
    } catch (error) {
      if (error.code === PG_UNIQUE_VIOLATION) {
        return res.status(409).json({ message: "Email already exists" });
      }
      throw error;
    }
  });

  app.put("/api/members/:id", async (req, res) => {
    const id = parseId(req.params.id);
    if (id === null) return res.status(400).json({ message: "Invalid id" });
    const { value, errors } = validateMember(req.body);
    if (errors) return res.status(400).json({ message: "Validation failed", errors });
    try {
      const result = await pool.query(
        "UPDATE members SET name = $1, email = $2 WHERE id = $3 RETURNING id, name, email",
        [value.name, value.email, id]
      );
      if (result.rowCount === 0) {
        return res.status(404).json({ message: "Member not found" });
      }
      res.json(result.rows[0]);
    } catch (error) {
      if (error.code === PG_UNIQUE_VIOLATION) {
        return res.status(409).json({ message: "Email already exists" });
      }
      throw error;
    }
  });

  app.delete("/api/members/:id", async (req, res) => {
    const id = parseId(req.params.id);
    if (id === null) return res.status(400).json({ message: "Invalid id" });
    const result = await pool.query("DELETE FROM members WHERE id = $1", [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Member not found" });
    }
    res.status(204).end();
  });

  app.use((req, res) => {
    res.status(404).json({ message: "Not found" });
  });

  // Express 5 chuyển lỗi của handler async vào đây.
  app.use((error, req, res, next) => {
    if (error.type === "entity.parse.failed") {
      return res.status(400).json({ message: "Invalid JSON body" });
    }
    if (error.type === "entity.too.large") {
      return res.status(413).json({ message: "Payload too large" });
    }
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  });

  return app;
}

export const app = createApp();
