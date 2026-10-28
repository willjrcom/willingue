import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";

const inputSchema = z.object({ role: z.enum(["STUDENT", "ADMIN", "GUARDIAN"]) });
const DEMO_PASSWORD = "Demo@12345";
const demoAccounts = {
  STUDENT: { email: "aluno@willingue.app", name: "Alex", label: "Aluno" },
  ADMIN: { email: "admin@willingue.app", name: "Administrador Demo", label: "Administrador" },
  GUARDIAN: { email: "responsavel@willingue.app", name: "Responsável Demo", label: "Responsável" },
} as const;

/** Creates/reuses fixed demo identities only; never an unrestricted signup endpoint. */
export async function POST(request: Request) {
  if (process.env.DEMO_SEED !== "true") {
    return NextResponse.json({ error: "A demonstração não está habilitada." }, { status: 404 });
  }
  const origin = request.headers.get("origin");
  const publicHost = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? new URL(request.url).host;
  if (origin && new URL(origin).host !== publicHost) {
    return NextResponse.json({ error: "Origem não permitida." }, { status: 403 });
  }
  const parsed = inputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Perfil de demonstração inválido." }, { status: 400 });
  }

  const role = parsed.data.role;
  const account = demoAccounts[role];
  try {
    const passwordHash = await hash(DEMO_PASSWORD, 12);
    await db.$transaction(async tx => {
      const user = await tx.user.upsert({
        where: { email: account.email },
        create: { email: account.email, name: account.name, role, passwordHash },
        update: { passwordHash, role },
      });
      if (role === "STUDENT") {
        await tx.studentProfile.upsert({
          where: { userId: user.id },
          create: { userId: user.id, nickname: "Alex", selectedAvatar: "🦊", coins: 75 },
          update: {},
        });
      }
    });
    return NextResponse.json({ role, label: account.label, email: account.email, password: DEMO_PASSWORD }, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Erro ao gerar conta de demonstração:", error);
    return NextResponse.json({ error: "Não foi possível gerar o acesso demonstrativo." }, { status: 500 });
  }
}
