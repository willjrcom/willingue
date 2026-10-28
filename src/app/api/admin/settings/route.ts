import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { isAuthorizedAdmin } from "@/lib/admin-access";
import { jsonError } from "@/lib/api";

const schema=z.object({
 schoolName:z.string().trim().min(2).max(110),
 description:z.string().trim().max(300),
 contactEmail:z.union([z.literal(""),z.string().trim().email().max(254)]),
 defaultLessonXp:z.number().int().min(0).max(10000),
 defaultLessonCoins:z.number().int().min(0).max(10000),
}).strict();

export async function PATCH(request:Request){
 if(!(await isAuthorizedAdmin(request)))return jsonError("Acesso não autorizado.",403);
 const result=schema.safeParse(await request.json().catch(()=>null));
 if(!result.success)return jsonError("Revise o nome da escola, contato e valores de pontuação.",400);
 try {
  await db.schoolSettings.upsert({where:{id:"school"},create:{id:"school",...result.data},
   update:result.data});
  return NextResponse.json({ok:true});
 }catch(err){console.error("Erro ao salvar configurações",err);
  return jsonError("Não foi possível salvar as configurações.",500);}
}
