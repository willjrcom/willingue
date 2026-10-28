/** Destination permitted for the authenticated user's role. */
export function homeForRole(user: { role: string; student?: unknown } | null): string {
  if (!user) return "/login";
  if (user.role === "STUDENT" && user.student) return "/learn";
  if (user.role === "ADMIN") return "/admin";
  if (user.role === "GUARDIAN") return "/guardian";
  return "/login";
}
