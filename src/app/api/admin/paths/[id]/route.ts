import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { jsonError } from "@/lib/api";
import { isAuthorizedAdmin } from "@/lib/admin-access";
import { pathSchema } from "@/lib/admin-learning-schemas";

export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){
  if(!(await isAuthorizedAdmin(request)))return jsonError("Acesso negado.",403);
  const {id}=await params, parsed=pathSchema.safeParse(await request.json().catch(()=>null));
  if(!parsed.success)return jsonError("Dados inválidos.");
  const existing=await db.learningPath.findUnique({where:{id}});
  if(!existing)return jsonError("Trilha não encontrada.",404);
  if(parsed.data.parentId){
    if(parsed.data.parentId===id)return jsonError("Uma trilha não pode ser filha dela mesma.");
    let parent:string|null=parsed.data.parentId;
    const visited=new Set<string>();
    while(parent){
      if(visited.has(parent)||parent===id)return jsonError("Essa alteração criaria um ciclo de trilhas.",409);
      visited.add(parent);
      const found=await db.learningPath.findUnique({where:{id:parent},select:{parentId:true}});
      if(!found)return jsonError("Trilha superior não encontrada.",404);
      parent=found.parentId;
    }
  }
  await db.learningPath.update({where:{id},data:parsed.data});
  return NextResponse.json({ok:true});
}
