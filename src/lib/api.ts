import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";

export async function getApiStudent() {
  const user = await currentUser();
  if (!user || user.role !== "STUDENT" || !user.student) return null;
  return { user, student: user.student };
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}
