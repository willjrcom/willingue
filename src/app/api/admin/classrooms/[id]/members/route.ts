import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { isAuthorizedAdmin } from "@/lib/admin-access";
import { jsonError } from "@/lib/api";

const schema = z.object({ studentId: z.string().min(1).max(120) });
type Context = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: Context) {
  if (!(await isAuthorizedAdmin(request))) return jsonError("Acesso não autorizado.", 403);
  const { id } = await context.params;
  const input = schema.safeParse(await request.json().catch(() => null));
  if (!input.success) return jsonError("Selecione um aluno.");
  const [classroom, student] = await Promise.all([
    db.classroom.findUnique({ where: { id }, select: { id: true } }),
    db.studentProfile.findUnique({ where: { id: input.data.studentId }, select: { id: true } }),
  ]);
  if (!classroom || !student) return jsonError("Turma ou aluno não encontrado.", 404);
  await db.classroomMember.upsert({
    where: { classroomId_studentId: { classroomId: id, studentId: student.id } },
    create: { classroomId: id, studentId: student.id }, update: {},
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request, context: Context) {
  if (!(await isAuthorizedAdmin(request))) return jsonError("Acesso não autorizado.", 403);
  const { id } = await context.params;
  const input = schema.safeParse(await request.json().catch(() => null));
  if (!input.success) return jsonError("Aluno inválido.");
  await db.classroomMember.deleteMany({
    where: { classroomId: id, studentId: input.data.studentId },
  });
  return NextResponse.json({ ok: true });
}
