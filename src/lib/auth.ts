import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import { db } from "@/lib/db";

const cookieName = "willingue_session";
const lifetime = 60 * 60 * 24 * 7;

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 32) throw new Error("AUTH_SECRET deve ter ao menos 32 caracteres.");
  return new TextEncoder().encode(value);
}

export async function signSession(userId: string) {
  return new SignJWT({ sub: userId }).setProtectedHeader({ alg: "HS256" })
    .setIssuedAt().setExpirationTime(`${lifetime}s`).sign(secret());
}

export async function setSession(userId: string) {
  const token = await signSession(userId);
  (await cookies()).set(cookieName, token, {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax",
    path: "/", maxAge: lifetime,
  });
}

export async function clearSession() {
  (await cookies()).delete(cookieName);
}

export async function currentUser() {
  const token = (await cookies()).get(cookieName)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ["HS256"] });
    if (typeof payload.sub !== "string") return null;
    return await db.user.findUnique({ where: { id: payload.sub }, include: { student: true } });
  } catch { return null; }
}

export async function requireStudent() {
  const user = await currentUser();
  if (!user || user.role !== "STUDENT" || !user.student) redirect("/login");
  return { user, student: user.student };
}
