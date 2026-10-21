// Chạy: node test.mjs  (Node 20+)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import worker, { handleRequest } from "./src/index.js";

const req = (p) => new Request("http://localhost" + p);
const assets = { fetch: () => new Response("tinh") };

let res = await handleRequest(req("/api/hello?name=An"), { ASSETS: assets });
let body = await res.json();
assert.equal(res.status, 200);
assert.equal(body.message, "Xin chào An");

body = await (await handleRequest(req("/api/env-check"), { ASSETS: assets })).json();
assert.equal(body.MY_SECRET_configured, false);

const text = await (
  await worker.fetch(req("/api/env-check"), { ASSETS: assets, MY_SECRET: "gia-tri-thu-nghiem" })
).text();
assert.equal(JSON.parse(text).MY_SECRET_configured, true);
assert.ok(!text.includes("gia-tri-thu-nghiem"), "không được lộ giá trị secret");

res = await handleRequest(req("/api/khong-co"), { ASSETS: assets });
assert.equal(res.status, 404);

res = await handleRequest(req("/"), { ASSETS: assets });
assert.equal(await res.text(), "tinh");

// Cấu hình: cần có thư mục assets và index.html, và không để secret trong file cấu hình.
const cfg = readFileSync(new URL("./wrangler.jsonc", import.meta.url), "utf8");
assert.ok(cfg.includes('"directory": "./public"'));
assert.ok(!/"vars"/.test(cfg), "không đặt secret trong vars");
assert.ok(readFileSync(new URL("./public/index.html", import.meta.url), "utf8").includes("<h1>"));
console.log("OK: cloudflare-workers-static");
