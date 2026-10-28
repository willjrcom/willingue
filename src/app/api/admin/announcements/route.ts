import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { isAuthorizedAdmin } from "@/lib/admin-access";
import { jsonError } from "@/lib/api";
import { announcementSchema } from "@/lib/announcements";

export async function POST(request: Request) {
  if (!(await isAuthorizedAdmin(request))) return jsonError("Acesso não autorizado.", 403);
  const input = announcementSchema.safeParse(await request.json().catch(() => null));
  if (!input.success) return jsonError("Confira título, mensagem, público e turma.", 400);
  if (input.data.audience === "CLASSROOM" && !await db.classroom.findFirst({
    where: { id: input.data.classroomId!, active: true },
  })) return jsonError("Turma não encontrada ou inativa.", 404);
  const admin = await currentUser();
  if (!admin) return jsonError("Sessão expirada.", 401);
  try {
    const created = await db.announcement.create({
      data: { ...input.data,
        classroomId: input.data.audience === "CLASSROOM" ? input.data.classroomId : null,
        createdBy: admin.name },
    });
    return NextResponse.json({ id: created.id }, { status: 201 });
  } catch (error) {
    console.error("Falha ao criar comunicado", error);
    return jsonError("Não foi possível salvar o comunicado.", 500);
  }
}
