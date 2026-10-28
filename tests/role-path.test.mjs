import test from 'node:test';
import assert from 'node:assert/strict';
import { homeForRole } from '../src/lib/role-path.ts';
import { isDemoAccount } from '../src/lib/demo.ts';

test('cada perfil acessa sua própria área', () => {
  assert.equal(homeForRole({role:'STUDENT',student:{id:'1'}}), '/learn');
  assert.equal(homeForRole({role:'ADMIN'}), '/admin');
  assert.equal(homeForRole({role:'GUARDIAN'}), '/guardian');
});
test('perfil ausente, desconhecido ou aluno sem cadastro não obtém acesso', () => {
  assert.equal(homeForRole(null), '/login');
  assert.equal(homeForRole({role:'STUDENT'}), '/login');
  assert.equal(homeForRole({role:'SUPERUSER'}), '/login');
});
test('identidades demonstrativas são identificadas apenas pelos e-mails reservados', () => {
  assert.equal(isDemoAccount('ALUNO@WILLINGUE.APP'), true);
  assert.equal(isDemoAccount('admin@willingue.app'), true);
  assert.equal(isDemoAccount('responsavel@willingue.app'), true);
  assert.equal(isDemoAccount('cliente@outraescola.com'), false);
});
