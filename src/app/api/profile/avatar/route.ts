import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getApiStudent, jsonError } from "@/lib/api";
const schema = z.object({ rewardId: z.string() });
export async function POST(request: Request) {
  const context = await getApiStudent();
  if (!context) return jsonError("Sessão expirada.", 401);
  const input = schema.safeParse(await request.json().catch(() => null));
  if (!input.success) return jsonError("Avatar inválido.");
  const ownership = await db.rewardRedemption.findUnique({ where: { studentId_rewardId: {
    studentId: context.student.id, rewardId: input.data.rewardId,
  } }, include: { reward: true } });
  if (!ownership || ownership.reward.category !== "AVATAR") return jsonError("Você não possui este avatar.", 403);
  await db.studentProfile.update({ where: { id: context.student.id }, data: { selectedAvatar: ownership.reward.icon } });
  return NextResponse.json({ ok: true });
}
