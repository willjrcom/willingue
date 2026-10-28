import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAuthorizedAdmin } from "@/lib/admin-access";
import { jsonError } from "@/lib/api";
import { announcementRecipients } from "@/lib/announcements";

export async function POST(request:Request,{params}:{params:Promise<{id:string}>}) {
  if(!(await isAuthorizedAdmin(request)))return jsonError("Acesso não autorizado.",403);
  const {id}=await params;
  const notice=await db.announcement.findUnique({where:{id}});
  if(!notice)return jsonError("Comunicado não encontrado.",404);
  if(notice.sentAt)return jsonError("Este comunicado já foi enviado.",409);
  try {
    const recipients=await announcementRecipients(notice.audience,notice.classroomId);
    if(!recipients.length)return jsonError("Não há destinatários para este comunicado.",409);
    await db.$transaction(async tx=>{
      // Conditional update prevents re-sends if two admins click simultaneously.
      const claimed=await tx.announcement.updateMany({where:{id,sentAt:null},
        data:{sentAt:new Date(),recipientCount:recipients.length}});
      if(!claimed.count)throw new Error("O comunicado já foi enviado.");
      for(let offset=0;offset<recipients.length;offset+=300){
        await tx.notification.createMany({data:recipients.slice(offset,offset+300).map(person=>({
          userId:person.userId,title:notice.title,message:notice.message,
          href:person.role==="STUDENT"?"/notificacoes":"/responsavel/notificacoes",
        }))});
      }
    });
    return NextResponse.json({ok:true,recipients:recipients.length});
  }catch(error){
    console.error("Falha ao enviar comunicado",error);
    return jsonError("Não foi possível enviar. Tente novamente.",500);
  }
}
