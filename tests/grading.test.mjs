import assert from 'node:assert/strict';
import test from 'node:test';
import { gradeQuestion } from '../src/lib/grading.ts';

const question = (kind, answer) => ({ id: 'q', kind, answer: JSON.stringify(answer) });

test('aceita múltipla escolha correta e rejeita resposta incorreta', () => {
  assert.equal(gradeQuestion(question('MULTIPLE_CHOICE', 'Hello!'), 'hello'), true);
  assert.equal(gradeQuestion(question('MULTIPLE_CHOICE', 'Hello!'), 'Goodbye'), false);
});
test('normaliza pontuação, acentos e maiúsculas', () => {
  assert.equal(gradeQuestion(question('TRANSLATION', ['Nice to meet you']), ' NICE TO MEET YOU! '), true);
  assert.equal(gradeQuestion(question('TRANSLATION', ['Olá']), 'Ola'), true);
});
test('compara ordens e associações sem aceitar permutações', () => {
  assert.equal(gradeQuestion(question('ORDER_WORDS', ['I','like','apples']), ['I','like','apples']), true);
  assert.equal(gradeQuestion(question('ORDER_WORDS', ['I','like','apples']), ['like','I','apples']), false);
  assert.equal(gradeQuestion(question('MATCHING', ['Obrigado','Por favor']), ['Obrigado','Por favor']), true);
  assert.equal(gradeQuestion(question('MATCHING', ['Obrigado','Por favor']), ['Por favor','Obrigado']), false);
});
test('questão malformada não passa', () => {
  assert.equal(gradeQuestion({id:'x',kind:'TRUE_FALSE',answer:'[INVALID'}, 'Verdadeiro'), false);
});
