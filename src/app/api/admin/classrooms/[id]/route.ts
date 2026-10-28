import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { isAuthorizedAdmin } from "@/lib/admin-access";
import { jsonError } from "@/lib/api";

const schema = z.object({
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().max(240),
  active: z.boolean(),
});
type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Context) {
  if (!(await isAuthorizedAdmin(request))) return jsonError("Acesso não autorizado.", 403);
  const { id } = await context.params;
  const input = schema.safeParse(await request.json().catch(() => null));
  if (!input.success) return jsonError("Dados da turma inválidos.");
  if (!(await db.classroom.findUnique({ where: { id }, select: { id: true } }))) return jsonError("Turma não encontrada.", 404);
  await db.classroom.update({ where: { id }, data: input.data });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request, context: Context) {
  if (!(await isAuthorizedAdmin(request))) return jsonError("Acesso não autorizado.", 403);
  const { id } = await context.params;
  const classroom = await db.classroom.findUnique({ where: { id }, select: { id: true } });
  if (!classroom) return jsonError("Turma não encontrada.", 404);
  await db.classroom.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
