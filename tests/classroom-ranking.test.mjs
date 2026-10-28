import test from "node:test";
import assert from "node:assert/strict";
import { rankClassmates, publicStudentName, startOfSchoolWeek } from "../src/lib/classroom-ranking.ts";

test("classifica pela quantidade de lições, sem alterar os dados de entrada", () => {
  const members = [
    { id: "a", name: "Alex", avatar: "🦊", completed: 2 },
    { id: "b", name: "Bia", avatar: "🦄", completed: 5 },
    { id: "c", name: "Léo", avatar: "🦁", completed: 3 },
  ];
  const ranked = rankClassmates(members);
  assert.deepEqual(ranked.map(item => [item.id, item.place]), [["b", 1], ["c", 2], ["a", 3]]);
  assert.deepEqual(members.map(item => item.id), ["a", "b", "c"]);
});
test("empatados dividem a posição", () => {
  const data = rankClassmates([
    { id: "1", name: "C", avatar: "🙂", completed: 4 },
    { id: "2", name: "A", avatar: "🙂", completed: 4 },
    { id: "3", name: "B", avatar: "🙂", completed: 1 },
  ]);
  assert.deepEqual(data.map(x => x.place), [1, 1, 3]);
});
test("semana começa segunda-feira à meia noite de São Paulo", () => {
  assert.equal(startOfSchoolWeek(new Date("2026-10-28T12:00:00Z")).toISOString(), "2026-10-26T03:00:00.000Z");
});
test("ranking não expõe nome completo ou e-mail", () => {
  assert.equal(publicStudentName("Marina Silva", "Nome Completo"), "Marina");
  assert.equal(publicStudentName(null, "Paulo da Silva"), "Paulo");
});
