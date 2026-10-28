import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { jsonError } from "@/lib/api";
import { isAuthorizedAdmin } from "@/lib/admin-access";
import { lessonSchema } from "@/lib/admin-learning-schemas";

export async function POST(request:Request){
  if(!(await isAuthorizedAdmin(request)))return jsonError("Acesso negado.",403);
  const parsed=lessonSchema.safeParse(await request.json().catch(()=>null));
  if(!parsed.success)return jsonError("Confira os dados e a pontuação da lição.");
  if(!(await db.learningPath.findUnique({where:{id:parsed.data.pathId}})))return jsonError("Trilha não encontrada.",404);
  // New lessons remain unpublished until at least one question is added.
  const lesson=await db.lesson.create({data:{...parsed.data,published:false}});
  return NextResponse.json({id:lesson.id},{status:201});
}
