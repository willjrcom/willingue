import { NextResponse } from "next/server";
import { db } from "@/lib/db";
export async function GET() {
  try { await db.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: "ok", service: "willingue", database: "connected" });
  } catch { return NextResponse.json({ status: "error", service: "willingue", database: "disconnected" }, { status: 503 }); }
}
