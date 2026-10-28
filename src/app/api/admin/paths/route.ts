import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { jsonError } from "@/lib/api";
import { isAuthorizedAdmin } from "@/lib/admin-access";
import { pathSchema } from "@/lib/admin-learning-schemas";

export async function POST(request:Request){
  if(!(await isAuthorizedAdmin(request)))return jsonError("Acesso negado.",403);
  const parsed=pathSchema.safeParse(await request.json().catch(()=>null));
  if(!parsed.success)return jsonError("Confira os dados da trilha.");
  if(parsed.data.parentId){
    const parent=await db.learningPath.findUnique({where:{id:parsed.data.parentId}});
    if(!parent)return jsonError("Trilha superior não encontrada.",404);
  }
  const trail=await db.learningPath.create({data:parsed.data});
  return NextResponse.json({id:trail.id},{status:201});
}
