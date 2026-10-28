import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { jsonError } from "@/lib/api";
import { isAuthorizedAdmin } from "@/lib/admin-access";
import { questionSchema, validQuestion } from "@/lib/admin-learning-schemas";

export async function POST(request:Request){
  if(!(await isAuthorizedAdmin(request)))return jsonError("Acesso negado.",403);
  const parsed=questionSchema.safeParse(await request.json().catch(()=>null));
  if(!parsed.success||!validQuestion(parsed.data))return jsonError("Questão inválida. Confira as opções e respostas.");
  if(!(await db.lesson.findUnique({where:{id:parsed.data.lessonId}})))return jsonError("Lição não encontrada.",404);
  const {options,answer,...data}=parsed.data;
  const question=await db.question.create({data:{
    ...data,options:JSON.stringify(options),answer:JSON.stringify(answer),
  }});
  return NextResponse.json({id:question.id},{status:201});
}
