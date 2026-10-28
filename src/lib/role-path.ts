/** Destination permitted for the authenticated user's role. */
export function homeForRole(user: { role: string; student?: unknown } | null): string {
  if (!user) return "/login";
  if (user.role === "STUDENT" && user.student) return "/aprender";
  if (user.role === "ADMIN") return "/administrador";
  if (user.role === "GUARDIAN") return "/responsavel";
  return "/login";
}
