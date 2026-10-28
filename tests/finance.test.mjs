import test from "node:test";
import assert from "node:assert/strict";
import { chargeStatus, parseAmountCents, sumCharges } from "../src/lib/finance.ts";

test("uma cobrança pendente vencida é atrasada", () => {
  assert.equal(chargeStatus({ status: "PENDING", dueAt: new Date("2026-10-01T12:00:00Z") },
    new Date("2026-10-28T12:00:00Z")), "OVERDUE");
});
test("pago e cancelado não viram atrasado", () => {
  assert.equal(chargeStatus({ status: "PAID", dueAt: new Date("2025-01-01T12:00:00Z") }), "PAID");
  assert.equal(chargeStatus({ status: "CANCELED", dueAt: new Date("2025-01-01T12:00:00Z") }), "CANCELED");
});
test("o vencimento do próprio dia ainda está a vencer", () => {
  assert.equal(chargeStatus({ status: "PENDING", dueAt: new Date("2026-10-28T12:00:00Z") },
    new Date("2026-10-28T19:00:00Z")), "PENDING");
});
test("quantias usam centavos e não floats na persistência", () => {
  assert.equal(parseAmountCents("189,90"), 18990);
  assert.equal(parseAmountCents("189.9"), 18990);
  assert.equal(parseAmountCents("4"), 400);
  assert.equal(parseAmountCents("0"), null);
  assert.equal(parseAmountCents("-2"), null);
  assert.equal(sumCharges([{ amountCents: 18990 }, { amountCents: 4990 }]), 23980);
});
