import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { isAuthorizedAdmin } from "@/lib/admin-access";
import { jsonError } from "@/lib/api";

const schema = z.object({
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().max(240).default(""),
});

export async function POST(request: Request) {
  if (!(await isAuthorizedAdmin(request))) return jsonError("Acesso não autorizado.", 403);
  const input = schema.safeParse(await request.json().catch(() => null));
  if (!input.success) return jsonError("Informe um nome de turma válido (2 a 80 caracteres).");
  try {
    const classroom = await db.classroom.create({ data: input.data });
    return NextResponse.json({ id: classroom.id }, { status: 201 });
  } catch (error) {
    console.error("Falha ao criar turma", error);
    return jsonError("Não foi possível criar a turma.", 500);
  }
}
