import { db } from "@/lib/db";
import { AdminCreatePage } from "@/components/admin-create-forms";
import { AdminAnnouncementForm } from "@/components/admin-announcement-form";
export const metadata={title:"Novo comunicado"};
export default async function NewAnnouncement(){
 const classrooms=await db.classroom.findMany({where:{active:true},select:{id:true,name:true},orderBy:{name:"asc"}});
 return <AdminCreatePage back="/administrador/comunicados" eyebrow="COMUNICAÇÃO ESCOLAR"
  title="Novo comunicado" description="Escreva um aviso, escolha os destinatários e revise antes de enviar.">
  <AdminAnnouncementForm classrooms={classrooms}/>
 </AdminCreatePage>;
}
