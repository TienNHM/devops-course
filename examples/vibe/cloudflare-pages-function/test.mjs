// Chạy: node test.mjs  (Node 20+)
import assert from "node:assert/strict";
import { onRequestGet as hello } from "./functions/api/hello.js";
import { onRequestGet as envCheck } from "./functions/api/env-check.js";

const req = (p) => new Request("http://localhost" + p);

let res = hello({ request: req("/api/hello?name=An"), env: {} });
let body = await res.json();
assert.equal(res.status, 200);
assert.equal(body.message, "Xin chào An");

body = await envCheck({ request: req("/api/env-check"), env: {} }).json();
assert.equal(body.MY_SECRET_configured, false);

const text = await envCheck({
  request: req("/api/env-check"),
  env: { MY_SECRET: "gia-tri-thu-nghiem" },
}).text();
assert.equal(JSON.parse(text).MY_SECRET_configured, true);
assert.ok(!text.includes("gia-tri-thu-nghiem"), "không được lộ giá trị secret");
console.log("OK: cloudflare-pages-function");
