import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { jsonError } from "@/lib/api";
import { isAuthorizedAdmin } from "@/lib/admin-access";

const schema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(8).max(120),
});

export async function POST(request: Request) {
  if (!(await isAuthorizedAdmin(request))) return jsonError("Acesso não autorizado.", 403);
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError("Informe nome, e-mail e senha com ao menos 8 caracteres.");
  if (await db.user.findUnique({ where: { email: parsed.data.email }, select: { id: true } })) {
    return jsonError("Já existe um cadastro com este e-mail.", 409);
  }
  try {
    const passwordHash = await hash(parsed.data.password, 12);
    const guardian = await db.user.create({
      data: { email: parsed.data.email, name: parsed.data.name, role: "GUARDIAN", passwordHash },
    });
    return NextResponse.json({ id: guardian.id }, { status: 201 });
  } catch (error) {
    console.error("Falha ao criar responsável", error);
    return jsonError("Não foi possível cadastrar responsável. Confira os dados.", 500);
  }
}
