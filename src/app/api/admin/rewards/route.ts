import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAuthorizedAdmin } from "@/lib/admin-access";
import { jsonError } from "@/lib/api";
import { rewardSchema } from "@/lib/admin-schemas";

export async function POST(request:Request){
  if(!(await isAuthorizedAdmin(request)))return jsonError("Acesso negado.",403);
  const input=rewardSchema.safeParse(await request.json().catch(()=>null));
  if(!input.success)return jsonError("Verifique nome, descrição, categoria e preço.");
  try{
    const item=await db.reward.create({data:input.data});
    return NextResponse.json({id:item.id},{status:201});
  }catch(err){console.error("Falha ao criar recompensa",err);return jsonError("Não foi possível cadastrar a recompensa.",500);}
}
