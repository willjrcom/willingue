import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { jsonError } from "@/lib/api";
import { isAuthorizedAdmin } from "@/lib/admin-access";
const schema=z.object({name:z.string().trim().min(2).max(100),
 email:z.string().trim().toLowerCase().email().max(254)}).strict();
export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){
 if(!(await isAuthorizedAdmin(request)))return jsonError("Acesso não autorizado.",403);
 const {id}=await params;const data=schema.safeParse(await request.json().catch(()=>null));
 if(!data.success)return jsonError("Confira nome e e-mail.",400);
 const guardian=await db.user.findFirst({where:{id,role:"GUARDIAN"},select:{id:true}});
 if(!guardian)return jsonError("Responsável não encontrado.",404);
 try{
  await db.user.update({where:{id},data:data.data});
  return NextResponse.json({ok:true});
 }catch(error){
  console.error("Falha ao editar responsável",error);
  return jsonError("Não foi possível salvar. Confira se o e-mail já está em uso.",409);
 }
}
