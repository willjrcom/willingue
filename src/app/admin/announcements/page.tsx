import Link from "next/link";
import { Megaphone, Plus, Send, UsersRound, FilePenLine } from "lucide-react";
import { db } from "@/lib/db";
import { AdminAnnouncements } from "@/components/admin-announcements";
export const metadata={title:"Comunicados"};
export default async function AdminAnnouncementsPage(){
 const [notices,classrooms]=await Promise.all([
  db.announcement.findMany({orderBy:{createdAt:"desc"},take:250}),
  db.classroom.findMany({select:{id:true,name:true},orderBy:{name:"asc"}}),
 ]);
 const sent=notices.filter(n=>!!n.sentAt);
 return <div className="admin-content">
  <div className="admin-page-heading"><div><p className="admin-eyebrow">COMUNICAÇÃO ESCOLAR</p>
   <h1>Comunicados</h1><p>Envie avisos para alunos, responsáveis ou turmas específicas.</p></div>
   <Link className="admin-action-primary" href="/administrador/comunicados/novo"><Plus size={17}/> Novo comunicado</Link>
  </div>
  <div className="admin-dash-insights">
   <div><span><Megaphone size={21}/></span><strong>{notices.length}</strong><small>Cadastrados</small></div>
   <div><span><Send size={21}/></span><strong>{sent.length}</strong><small>Enviados</small></div>
   <div><span><FilePenLine size={21}/></span><strong>{notices.length-sent.length}</strong><small>Rascunhos</small></div>
   <div><span><UsersRound size={21}/></span><strong>{sent.reduce((a,n)=>a+n.recipientCount,0)}</strong><small>Notificações entregues no app</small></div>
  </div>
  <AdminAnnouncements notices={notices.map(n=>({id:n.id,title:n.title,message:n.message,
    audience:n.audience,classroomId:n.classroomId,author:n.createdBy,
    createdAt:n.createdAt.toISOString(),sentAt:n.sentAt?.toISOString()??null,
    recipientCount:n.recipientCount}))} classrooms={classrooms}/>
 </div>;
}
