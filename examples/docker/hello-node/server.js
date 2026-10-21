// App Express nhỏ, dùng để so sánh hai Dockerfile (naive vs optimized).
import express from "express";

const app = express();
const port = Number(process.env.PORT ?? 3000);

app.get("/health", (req, res) => {
  res.json({ status: "healthy" });
});

app.get("/", (req, res) => {
  res.type("text/plain").send(`Hello from hello-node (uid=${process.getuid?.()})\n`);
});

const server = app.listen(port, "0.0.0.0", () => {
  console.log(`hello-node listening on ${port}`);
});

process.on("SIGTERM", () => server.close(() => process.exit(0)));
