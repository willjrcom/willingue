import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getApiStudent, jsonError } from "@/lib/api";
import { resolveExperience } from "@/lib/student-experience";

const schema = z.object({
  preference: z.enum(["AUTO", "KIDS", "TEEN", "ADULT"]),
  birthDate: z.string().nullable(),
});

export async function POST(request: Request) {
  const context = await getApiStudent();
  if (!context) return jsonError("Sessão expirada.", 401);
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError("Selecione um estilo e informe uma data válida.");

  let birthDate: Date | null = null;
  if (parsed.data.birthDate !== null) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(parsed.data.birthDate)) return jsonError("Data de nascimento inválida.");
    birthDate = new Date(parsed.data.birthDate + "T12:00:00.000Z");
    const now = new Date();
    if (!Number.isFinite(birthDate.getTime())
      || birthDate.toISOString().slice(0, 10) !== parsed.data.birthDate
      || birthDate.getUTCFullYear() < 1900 || birthDate.getTime() > now.getTime()) {
      return jsonError("Informe uma data de nascimento válida, que não seja no futuro.");
    }
  }

  const updated = await db.studentProfile.update({
    where: { id: context.student.id },
    data: { interfaceMode: parsed.data.preference, birthDate },
    select: { interfaceMode: true, birthDate: true },
  });
  return NextResponse.json({ ok: true, experience: resolveExperience(updated) });
}
