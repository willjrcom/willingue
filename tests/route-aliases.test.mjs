import test from "node:test";
import assert from "node:assert/strict";
import { canonicalizePath } from "../src/lib/route-aliases.ts";
const cases = {
  "/administrador":"/admin",
  "/administrador/alunos":"/admin/students",
  "/administrador/alunos/novo":"/admin/students/new",
  "/administrador/alunos/student-123":"/admin/students/student-123",
  "/administrador/turmas/nova":"/admin/classrooms/new",
  "/administrador/responsaveis/vincular":"/admin/guardians/link",
  "/administrador/responsaveis/novo":"/admin/guardians/new",
  "/administrador/responsaveis/guardian-123":"/admin/guardians/guardian-123",
  "/administrador/aprendizado":"/admin/learning",
  "/administrador/financeiro/nova":"/admin/finance/new",
  "/administrador/recompensas":"/admin/rewards",
  "/administrador/comunicados/novo":"/admin/announcements/new",
  "/administrador/relatorios":"/admin/reports",
  "/administrador/configuracoes":"/admin/settings",
  "/responsavel":"/guardian",
  "/responsavel/alunos/student-123":"/guardian/students/student-123",
  "/responsavel/financeiro":"/guardian/finance",
  "/responsavel/notificacoes":"/guardian/notifications",
  "/responsavel/perfil":"/guardian/profile",
  "/aprender":"/learn", "/atividades":"/activities",
  "/contas":"/billing", "/licoes/lesson-123":"/lessons/lesson-123",
  "/minha-turma":"/my-class", "/notificacoes":"/notifications",
  "/perfil":"/profile", "/preferencias":"/preferences",
  "/recompensas":"/rewards", "/trilhas/path-123":"/paths/path-123",
  "/admin/alunos/novo":"/admin/students/new",
  "/guardian/alunos/student-123":"/guardian/students/student-123",
};
test("endereço antigo redireciona para o equivalente em inglês",()=>{
  for (const [oldPath, canonical] of Object.entries(cases))
    assert.equal(canonicalizePath(oldPath), canonical, oldPath);
});
test("rotas novas e APIs nunca são alteradas",()=>{
  for(const value of ["/","/login","/admin/students/new","/guardian/students/a",
    "/learn","/lessons/id","/api/admin/students","/api/lessons/id/complete",
    "/opengraph-image","/admin","/guardian"])
    assert.equal(canonicalizePath(value),value);
});
test("IDs e barras finais são preservados",()=>{
  assert.equal(canonicalizePath("/administrador/alunos/id-de-um-aluno/"),"/admin/students/id-de-um-aluno/");
  assert.equal(canonicalizePath("/trilhas/novo"),"/paths/novo");
  assert.equal(canonicalizePath("/guardian/students/id-do-aluno"),"/guardian/students/id-do-aluno");
});
