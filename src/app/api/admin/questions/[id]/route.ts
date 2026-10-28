import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { jsonError } from "@/lib/api";
import { isAuthorizedAdmin } from "@/lib/admin-access";
import { questionSchema, validQuestion } from "@/lib/admin-learning-schemas";

export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){
  if(!(await isAuthorizedAdmin(request)))return jsonError("Acesso negado.",403);
  const {id}=await params,parsed=questionSchema.safeParse(await request.json().catch(()=>null));
  if(!parsed.success||!validQuestion(parsed.data))return jsonError("Questão inválida. Confira as opções e respostas.");
  const q=await db.question.findUnique({where:{id}});
  if(!q||q.lessonId!==parsed.data.lessonId)return jsonError("Questão não encontrada.",404);
  const {options,answer,...data}=parsed.data;
  await db.question.update({where:{id},data:{...data,options:JSON.stringify(options),answer:JSON.stringify(answer)}});
  return NextResponse.json({ok:true});
}
