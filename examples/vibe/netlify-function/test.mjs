// Chạy: node test.mjs  (Node 20+)
import assert from "node:assert/strict";
import hello from "./netlify/functions/hello.mjs";
import envCheck from "./netlify/functions/env-check.mjs";

let res = await hello(new Request("http://localhost/api/hello?name=An"), {});
let body = await res.json();
assert.equal(res.status, 200);
assert.equal(body.message, "Xin chào An");

delete process.env.MY_SECRET;
body = await (await envCheck(new Request("http://localhost/api/env-check"), {})).json();
assert.equal(body.MY_SECRET_configured, false);

process.env.MY_SECRET = "gia-tri-thu-nghiem";
const text = await (await envCheck(new Request("http://localhost/api/env-check"), {})).text();
assert.equal(JSON.parse(text).MY_SECRET_configured, true);
assert.ok(!text.includes("gia-tri-thu-nghiem"), "không được lộ giá trị secret");
console.log("OK: netlify-function");
