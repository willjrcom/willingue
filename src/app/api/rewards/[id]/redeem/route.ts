import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getApiStudent, jsonError } from "@/lib/api";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const context = await getApiStudent();
  if (!context) return jsonError("Sessão expirada.", 401);
  const { id } = await params;
  const reward = await db.reward.findUnique({ where: { id } });
  if (!reward || !reward.active) return jsonError("Recompensa indisponível.", 404);
  const existing = await db.rewardRedemption.findUnique({ where: { studentId_rewardId: { studentId: context.student.id, rewardId: id } } });
  if (existing) return jsonError("Você já desbloqueou esta recompensa.", 409);
  try {
    await db.$transaction(async tx => {
      const debit = await tx.studentProfile.updateMany({ where: { id: context.student.id, coins: { gte: reward.price } }, data: { coins: { decrement: reward.price } } });
      if (!debit.count) throw new Error("INSUFFICIENT_COINS");
      await tx.rewardRedemption.create({ data: { studentId: context.student.id, rewardId: id } });
      await tx.notification.create({ data: { userId: context.user.id, title: "Recompensa desbloqueada! 🎁", message: `Você desbloqueou ${reward.name}. Confira sua coleção!`, href: "/recompensas" } });
    });
  } catch (error) {
    if (error instanceof Error && error.message === "INSUFFICIENT_COINS") return jsonError("Você ainda não tem moedas suficientes.", 409);
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") return jsonError("Esta recompensa já foi desbloqueada.", 409);
    throw error;
  }
  const current = await db.studentProfile.findUnique({ where: { id: context.student.id }, select: { coins: true } });
  return NextResponse.json({ ok: true, coins: current?.coins ?? 0 });
}
