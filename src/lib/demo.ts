export const demoEmails = new Set([
  "aluno@willingue.app",
  "admin@willingue.app",
  "responsavel@willingue.app",
]);

export function isDemoAccount(email: string): boolean {
  return demoEmails.has(email.toLowerCase());
}
