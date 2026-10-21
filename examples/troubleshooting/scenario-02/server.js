import http from "node:http";

const port = Number(process.env.PORT || 3000);

http
  .createServer((req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ status: "healthy", service: "club-notes" }));
  })
  .listen(port, "0.0.0.0", () => {
    console.log(`club-notes listening on port ${port}`);
  });
