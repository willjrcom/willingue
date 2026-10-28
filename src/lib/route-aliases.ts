/** Canonical, English-only URLs for browser navigation. No database records are changed. */
const studentRoots: Record<string,string> = {
  aprender: "learn", atividades: "activities", contas: "billing",
  licoes: "lessons", "minha-turma": "my-class",
  notificacoes: "notifications", perfil: "profile",
  preferencias: "preferences", recompensas: "rewards", trilhas: "paths",
};
const adminChildren: Record<string,string> = {
  alunos: "students", aprendizado: "learning", comunicados: "announcements",
  configuracoes: "settings", financeiro: "finance", recompensas: "rewards",
  relatorios: "reports", responsaveis: "guardians", turmas: "classrooms",
};
const guardianChildren: Record<string,string> = {
  alunos: "students", financeiro: "finance", notificacoes: "notifications", perfil: "profile",
};
const actions: Record<string,string> = { novo: "new", nova: "new", vincular: "link" };

export function canonicalizePath(pathname: string): string {
  const segments = pathname.split("/");
  if (segments.length < 2) return pathname;
  const root = segments[1];
  if (root === "administrador" || root === "admin") {
    segments[1] = "admin";
    if (segments[2]) segments[2] = adminChildren[segments[2]] || segments[2];
    if (segments[3]) segments[3] = actions[segments[3]] || segments[3];
  } else if (root === "responsavel" || root === "guardian") {
    segments[1] = "guardian";
    if (segments[2]) segments[2] = guardianChildren[segments[2]] || segments[2];
  } else if (studentRoots[root]) {
    segments[1] = studentRoots[root];
  }
  return segments.join("/");
}
