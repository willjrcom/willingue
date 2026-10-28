import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { jsonError } from "@/lib/api";
import { isAuthorizedAdmin } from "@/lib/admin-access";

const schema = z.object({
  guardianId: z.string().min(1).max(120),
  studentId: z.string().min(1).max(120),
  financialResponsible: z.boolean(),
});

export async function POST(request: Request) {
  if (!(await isAuthorizedAdmin(request))) return jsonError("Acesso não autorizado.", 403);
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError("Selecione um aluno e um responsável.");
  const { guardianId, studentId, financialResponsible } = parsed.data;
  const [guardian, student] = await Promise.all([
    db.user.findFirst({ where: { id: guardianId, role: "GUARDIAN" }, select: { id: true } }),
    db.studentProfile.findUnique({ where: { id: studentId }, select: { id: true } }),
  ]);
  if (!guardian || !student) return jsonError("Aluno ou responsável não encontrado.", 404);
  await db.guardianStudent.upsert({
    where: { guardianId_studentId: { guardianId, studentId } },
    create: { guardianId, studentId, financialResponsible },
    update: { financialResponsible },
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  if (!(await isAuthorizedAdmin(request))) return jsonError("Acesso não autorizado.", 403);
  const parsed = schema.pick({ guardianId: true, studentId: true }).safeParse(
    await request.json().catch(() => null)
  );
  if (!parsed.success) return jsonError("Vínculo inválido.");
  const { guardianId, studentId } = parsed.data;
  const unpaid = await db.charge.count({
    where: { studentId, payerGuardianId: guardianId, status: "PENDING" },
  });
  if (unpaid > 0) return jsonError("Este responsável tem cobranças em aberto neste aluno. Ajuste o financeiro antes de remover o vínculo.", 409);
  await db.guardianStudent.deleteMany({ where: { guardianId, studentId } });
  return NextResponse.json({ ok: true });
}
