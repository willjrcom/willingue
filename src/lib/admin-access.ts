import { currentUser } from "@/lib/auth";

/** Authentication and same-origin check for cookie-authenticated admin APIs. */
export async function isAuthorizedAdmin(request: Request): Promise<boolean> {
  const user = await currentUser();
  if (user?.role !== "ADMIN") return false;
  const origin = request.headers.get("origin");
  const requestHost = request.headers.get("x-forwarded-host")
    ?? request.headers.get("host")
    ?? new URL(request.url).host;
  if (origin) {
    try {
      if (new URL(origin).host !== requestHost) return false;
    } catch {
      return false;
    }
  }
  return true;
}
