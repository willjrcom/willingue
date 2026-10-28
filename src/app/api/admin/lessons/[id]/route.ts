import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { jsonError } from "@/lib/api";
import { isAuthorizedAdmin } from "@/lib/admin-access";
import { lessonSchema } from "@/lib/admin-learning-schemas";

export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){
  if(!(await isAuthorizedAdmin(request)))return jsonError("Acesso negado.",403);
  const {id}=await params, parsed=lessonSchema.safeParse(await request.json().catch(()=>null));
  if(!parsed.success)return jsonError("Verifique as informações da lição.");
  const [lesson,path]=await Promise.all([
    db.lesson.findUnique({where:{id},select:{id:true}}),
    db.learningPath.findUnique({where:{id:parsed.data.pathId},select:{id:true}}),
  ]);
  if(!lesson||!path)return jsonError("Lição ou trilha não encontrada.",404);
  if(parsed.data.published){
    const questionCount=await db.question.count({where:{lessonId:id}});
    if(questionCount===0)return jsonError("Adicione uma questão antes de publicar a lição.",409);
  }
  await db.lesson.update({where:{id},data:parsed.data});
  return NextResponse.json({ok:true});
}
