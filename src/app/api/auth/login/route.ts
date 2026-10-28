import { NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { setSession } from "@/lib/auth";
import { jsonError } from "@/lib/api";
import { homeForRole } from "@/lib/role-path";
import { isDemoAccount } from "@/lib/demo";

const schema = z.object({ email: z.string().email().max(254), password: z.string().min(1).max(200) });
export async function POST(request: Request) {
  const input = schema.safeParse(await request.json().catch(() => null));
  if (!input.success) return jsonError("Informe um e-mail e uma senha válidos.");
  const user = await db.user.findUnique({ where: { email: input.data.email.toLowerCase().trim() }, include: { student: true } });
  if (!user || !(await compare(input.data.password, user.passwordHash))) return jsonError("E-mail ou senha inválidos.", 401);
  if (isDemoAccount(user.email) && process.env.DEMO_SEED !== "true") return jsonError("Acesso demonstrativo desabilitado.", 403);
  const destination = homeForRole(user);
  if (destination === "/login") return jsonError("Este perfil não está disponível.", 403);
  await setSession(user.id);
  return NextResponse.json({ ok: true, redirect: destination });
}
