import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getApiStudent, jsonError } from "@/lib/api";
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const context = await getApiStudent();
  if (!context) return jsonError("Sessão expirada.", 401);
  const { id } = await params;
  await db.notification.updateMany({ where: { id, userId: context.user.id, readAt: null }, data: { readAt: new Date() } });
  return NextResponse.json({ ok: true });
}
