import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { jsonError } from "@/lib/api";
import { isAuthorizedAdmin } from "@/lib/admin-access";
import { parseAmountCents } from "@/lib/finance";

const schema = z.object({
  studentId: z.string().min(1).max(120),
  title: z.string().trim().min(3).max(120),
  amount: z.string().min(1).max(20),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  payerType: z.enum(["STUDENT", "GUARDIAN"]),
  payerGuardianId: z.string().max(120).nullable(),
});
export async function POST(request: Request) {
  if (!(await isAuthorizedAdmin(request))) return jsonError("Acesso não autorizado.", 403);
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError("Confira o aluno, valor, vencimento e pagante.");
  const input = parsed.data;
  const amountCents = parseAmountCents(input.amount);
  if (!amountCents) return jsonError("Valor inválido. Exemplo: 189,90.");
  const dueAt = new Date(input.dueDate + "T12:00:00.000Z");
  if (Number.isNaN(dueAt.getTime()) || dueAt.toISOString().slice(0, 10) !== input.dueDate) {
    return jsonError("Vencimento inválido.");
  }
  const student = await db.studentProfile.findUnique({
    where: { id: input.studentId },
    select: { id: true, userId: true },
  });
  if (!student) return jsonError("Aluno não encontrado.", 404);
  if (input.payerType === "GUARDIAN") {
    const linked = input.payerGuardianId && await db.guardianStudent.findUnique({
      where: { guardianId_studentId: { guardianId: input.payerGuardianId, studentId: student.id } },
    });
    if (!linked) return jsonError("Escolha um responsável vinculado ao aluno.", 400);
  }
  try {
    const links = await db.guardianStudent.findMany({
      where: { studentId: student.id }, select: { guardianId: true },
    });
    const recipients = [...new Set([student.userId, ...links.map(link => link.guardianId)])];
    const charge = await db.$transaction(async tx => {
      const created = await tx.charge.create({
        data: {
          studentId: student.id, title: input.title, amountCents, dueAt,
          payerType: input.payerType,
          payerGuardianId: input.payerType === "GUARDIAN" ? input.payerGuardianId : null,
        },
      });
      if (recipients.length) await tx.notification.createMany({
        data: recipients.map(userId => ({
          userId, title: "Nova cobrança da escola",
          message: `${input.title} — vencimento em ${input.dueDate.split("-").reverse().join("/")}`,
          href: userId === student.userId ? "/contas" : "/responsavel/financeiro",
        })),
      });
      return created;
    });
    return NextResponse.json({ id: charge.id }, { status: 201 });
  } catch (error) {
    console.error("Falha ao registrar cobrança", error);
    return jsonError("Não foi possível cadastrar a cobrança.", 500);
  }
}
