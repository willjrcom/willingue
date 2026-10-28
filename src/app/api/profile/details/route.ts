import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getApiStudent, jsonError } from "@/lib/api";

const schema = z.object({
  name: z.string().trim().min(2).max(100),
  nickname: z.string().trim().max(32),
  avatar: z.string().min(1).max(32),
}).strict();

export async function POST(request: Request) {
  const context = await getApiStudent();
  if (!context) return jsonError("Sessão expirada. Entre novamente.", 401);

  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? new URL(request.url).host;
  if (origin) {
    try {
      if (new URL(origin).host !== host) return jsonError("Origem não permitida.", 403);
    } catch {
      return jsonError("Origem não permitida.", 403);
    }
  }

  const payload = schema.safeParse(await request.json().catch(() => null));
  if (!payload.success) return jsonError("Confira seu nome, apelido e avatar.", 400);
  const { name, nickname, avatar } = payload.data;
  if (avatar !== "🦊" && avatar !== context.student.selectedAvatar) {
    const ownsAvatar = await db.rewardRedemption.findFirst({
      where: {
        studentId: context.student.id,
        reward: { category: "AVATAR", icon: avatar },
      },
      select: { id: true },
    });
    if (!ownsAvatar) return jsonError("Escolha um avatar que já está na sua coleção.", 403);
  }
  try {
    await db.$transaction([
      db.user.update({ where: { id: context.user.id }, data: { name } }),
      db.studentProfile.update({
        where: { id: context.student.id },
        data: { nickname: nickname || null, selectedAvatar: avatar },
      }),
    ]);
    return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (cause) {
    console.error("Falha ao atualizar o perfil do aluno", cause);
    return jsonError("Não foi possível salvar o perfil. Tente novamente.", 500);
  }
}
