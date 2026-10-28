import test from "node:test";
import assert from "node:assert/strict";
import { readApiJson } from "../src/lib/api-client.ts";

test("retorna os dados de uma resposta JSON válida", async () => {
  const result = await readApiJson(new Response(JSON.stringify({ redirect: "/aprender" }), { status: 200 }));
  assert.equal(result.redirect, "/aprender");
});
test("explica a resposta vazia sem lançar SyntaxError", async () => {
  await assert.rejects(() => readApiJson(new Response(null, { status: 500 })), /HTTP 500/);
});
test("explica uma resposta HTML do proxy", async () => {
  await assert.rejects(() => readApiJson(new Response("<html>Bad Gateway</html>", { status: 502 })), /resposta inválida/);
});
