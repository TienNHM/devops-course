import express from "express";
import { pool } from "./db.js";

export const app = express();

app.use(express.json());

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
  try {
    const result = await pool.query(
      "SELECT id, name, email FROM members ORDER BY id"
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// TODO (Capstone): POST /api/members, PUT /api/members/:id, DELETE /api/members/:id
