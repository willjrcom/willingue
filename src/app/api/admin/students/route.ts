import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { isAuthorizedAdmin } from "@/lib/admin-access";
import { jsonError } from "@/lib/api";

const schema = z.object({
  name: z.string().trim().min(2).max(100),
  nickname: z.string().trim().max(32).default(""),
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(8).max(120),
  classroomId: z.string().max(120).optional(),
});

export async function POST(request: Request) {
  if (!(await isAuthorizedAdmin(request))) return jsonError("Acesso não autorizado.", 403);
  const input = schema.safeParse(await request.json().catch(() => null));
  if (!input.success) return jsonError("Informe nome, e-mail válido e senha com pelo menos 8 caracteres.");
  const { name, nickname, email, password, classroomId } = input.data;
  if (await db.user.findUnique({ where: { email }, select: { id: true } })) return jsonError("Este e-mail já está cadastrado.", 409);
  if (classroomId && !(await db.classroom.findUnique({ where: { id: classroomId }, select: { id: true } }))) {
    return jsonError("Turma selecionada não encontrada.", 404);
  }
  try {
    const passwordHash = await hash(password, 12);
    const student = await db.$transaction(async tx => {
      const user = await tx.user.create({ data: { email, name, role: "STUDENT", passwordHash } });
      const profile = await tx.studentProfile.create({
        data: { userId: user.id, nickname: nickname || name.split(/\s+/)[0] },
      });
      if (classroomId) await tx.classroomMember.create({
        data: { classroomId, studentId: profile.id },
      });
      return profile;
    });
    return NextResponse.json({ id: student.id }, { status: 201 });
  } catch (error) {
    console.error("Falha ao cadastrar aluno", error);
    return jsonError("Não foi possível cadastrar aluno. Confira se o e-mail está disponível.", 500);
  }
}
