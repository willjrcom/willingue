import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAuthorizedAdmin } from "@/lib/admin-access";
import { jsonError } from "@/lib/api";
import { rewardSchema } from "@/lib/admin-schemas";

export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){
  if(!(await isAuthorizedAdmin(request)))return jsonError("Acesso negado.",403);
  const {id}=await params;
  const input=rewardSchema.safeParse(await request.json().catch(()=>null));
  if(!input.success)return jsonError("Dados inválidos para a recompensa.");
  const item=await db.reward.findUnique({where:{id},select:{id:true}});
  if(!item)return jsonError("Recompensa não encontrada.",404);
  await db.reward.update({where:{id},data:input.data});
  return NextResponse.json({ok:true});
}
