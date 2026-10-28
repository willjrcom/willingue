import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { jsonError } from "@/lib/api";
import { isAuthorizedAdmin } from "@/lib/admin-access";

const schema = z.object({ status: z.enum(["PENDING", "PAID", "CANCELED"]) });
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthorizedAdmin(request))) return jsonError("Acesso não autorizado.", 403);
  const input = schema.safeParse(await request.json().catch(() => null));
  if (!input.success) return jsonError("Situação inválida.");
  const { id } = await params;
  const existing = await db.charge.findUnique({
    where: { id }, include: { student: { select: { userId: true } } },
  });
  if (!existing) return jsonError("Cobrança não encontrada.", 404);
  if (existing.status === input.data.status) return NextResponse.json({ ok: true });
  const links = await db.guardianStudent.findMany({
    where: { studentId: existing.studentId }, select: { guardianId: true },
  });
  const recipients = [...new Set([existing.student.userId, ...links.map(l => l.guardianId)])];
  const statusTitle = input.data.status === "PAID" ? "Pagamento registrado pela escola"
    : input.data.status === "CANCELED" ? "Cobrança cancelada"
      : "Cobrança em aberto";
  try {
    await db.$transaction(async tx => {
      await tx.charge.update({
        where: { id },
        data: {
          status: input.data.status,
          paidAt: input.data.status === "PAID" ? new Date() : null,
        },
      });
      if (recipients.length) await tx.notification.createMany({
        data: recipients.map(userId => ({
          userId, title: statusTitle, message: existing.title,
          href: userId === existing.student.userId ? "/billing" : "/guardian/finance",
        })),
      });
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Falha ao atualizar cobrança", error);
    return jsonError("Não foi possível alterar a situação.", 500);
  }
}
