// Chạy: node test.mjs  (không cần cài gì, Node 20+)
import assert from "node:assert/strict";
import hello from "./api/hello.js";
import envCheck from "./api/env-check.js";

let res = await hello.fetch(new Request("http://localhost/api/hello?name=An"));
let body = await res.json();
assert.equal(res.status, 200);
assert.equal(body.message, "Xin chào An");

delete process.env.MY_SECRET;
body = await (await envCheck.fetch()).json();
assert.equal(body.MY_SECRET_configured, false);

process.env.MY_SECRET = "gia-tri-thu-nghiem";
const text = await (await envCheck.fetch()).text();
assert.equal(JSON.parse(text).MY_SECRET_configured, true);
assert.ok(!text.includes("gia-tri-thu-nghiem"), "không được lộ giá trị secret");
console.log("OK: vercel-api");
