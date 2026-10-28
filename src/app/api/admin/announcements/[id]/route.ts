import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAuthorizedAdmin } from "@/lib/admin-access";
import { jsonError } from "@/lib/api";
import { announcementSchema } from "@/lib/announcements";

export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}) {
  if (!(await isAuthorizedAdmin(request))) return jsonError("Acesso não autorizado.",403);
  const {id}=await params;
  const input=announcementSchema.safeParse(await request.json().catch(()=>null));
  if(!input.success)return jsonError("Confira título, mensagem e público.",400);
  if(input.data.audience==="CLASSROOM"&&!await db.classroom.findFirst({
    where:{id:input.data.classroomId!,active:true},
  }))return jsonError("Turma não encontrada ou inativa.",404);
  const result=await db.announcement.updateMany({
    where:{id,sentAt:null},
    data:{...input.data,classroomId:input.data.audience==="CLASSROOM"?input.data.classroomId:null},
  });
  if(!result.count)return jsonError("Comunicado não encontrado ou já enviado.",409);
  return NextResponse.json({ok:true});
}
