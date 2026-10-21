import test from "node:test";
import assert from "node:assert/strict";
import { greet } from "../greet.js";

test("greet trả về lời chào đúng", () => {
  assert.equal(greet("CLB"), "Xin chào, CLB!");
});
