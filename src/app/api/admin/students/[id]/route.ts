import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { isAuthorizedAdmin } from "@/lib/admin-access";
import { jsonError } from "@/lib/api";

const schema = z.object({
  name: z.string().trim().min(2).max(100),
  nickname: z.string().trim().max(32),
  birthDate: z.string().nullable(),
  assignedPathIds: z.array(z.string().min(1).max(120)).max(250),
});
export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){
  if(!(await isAuthorizedAdmin(request))) return jsonError("Acesso não autorizado.",403);
  const {id}=await params;
  const input=schema.safeParse(await request.json().catch(()=>null));
  if(!input.success)return jsonError("Verifique os dados informados.",400);
  const student=await db.studentProfile.findUnique({where:{id}});
  if(!student)return jsonError("Aluno não encontrado.",404);
  let birthDate:Date|null=null;
  if(input.data.birthDate){
    if(!/^\d{4}-\d{2}-\d{2}$/.test(input.data.birthDate))return jsonError("Data inválida.");
    birthDate=new Date(input.data.birthDate+"T12:00:00.000Z");
    if(!Number.isFinite(birthDate.getTime())||birthDate.toISOString().slice(0,10)!==input.data.birthDate||
      birthDate>new Date()||birthDate.getUTCFullYear()<1900)return jsonError("Data inválida.");
  }
  const ids=[...new Set(input.data.assignedPathIds)];
  if(ids.length){
    const found=await db.learningPath.count({where:{id:{in:ids}}});
    if(found!==ids.length)return jsonError("Uma das trilhas selecionadas não existe.");
  }
  try{
    await db.$transaction(async tx=>{
      await tx.user.update({where:{id:student.userId},data:{name:input.data.name}});
      await tx.studentProfile.update({where:{id},data:{nickname:input.data.nickname || null,birthDate}});
      await tx.pathEnrollment.deleteMany({where:{studentId:id,pathId:{notIn:ids}}});
      for(const pathId of ids)await tx.pathEnrollment.upsert({
        where:{studentId_pathId:{studentId:id,pathId}},
        create:{studentId:id,pathId},update:{},
      });
    });
    return NextResponse.json({ok:true});
  }catch(e){console.error("Erro ao atualizar aluno",e);return jsonError("Não foi possível salvar.",500);}
}
