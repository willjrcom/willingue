import test from "node:test";
import assert from "node:assert/strict";
import { ageOn, resolveExperience } from "../src/lib/student-experience.ts";

test("troca de faixa somente no aniversário", () => {
  const birthday = new Date("2014-10-29T12:00:00.000Z");
  assert.equal(ageOn(birthday, new Date("2026-10-28T12:00:00Z")), 11);
  assert.equal(ageOn(birthday, new Date("2026-10-29T12:00:00Z")), 12);
});
test("faixas de idade automática: infantil, jovem e adulto", () => {
  const now = new Date("2026-10-28T12:00:00Z");
  assert.equal(resolveExperience({ birthDate: new Date("2017-04-13T12:00:00Z") }, now), "kids");
  assert.equal(resolveExperience({ birthDate: new Date("2011-04-13T12:00:00Z") }, now), "teen");
  assert.equal(resolveExperience({ birthDate: new Date("2001-04-13T12:00:00Z") }, now), "adult");
});
test("sem data de nascimento preserva a experiência infantil existente", () => {
  assert.equal(resolveExperience({ interfaceMode: "AUTO" }), "kids");
});
test("preferência manual prevalece sobre a idade", () => {
  const adultBirth = new Date("1990-04-13T12:00:00Z");
  assert.equal(resolveExperience({ interfaceMode: "KIDS", birthDate: adultBirth }), "kids");
  assert.equal(resolveExperience({ interfaceMode: "TEEN", birthDate: adultBirth }), "teen");
  assert.equal(resolveExperience({ interfaceMode: "ADULT" }), "adult");
});
