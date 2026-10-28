import { db } from "@/lib/db";
import { AdminCreatePage, GuardianLinkForm } from "@/components/admin-create-forms";
export const metadata={title:"Vincular aluno"};
export default async function RegisterGuardianLink(){
  const [guardians,students]=await Promise.all([
    db.user.findMany({where:{role:"GUARDIAN"},select:{id:true,name:true},orderBy:{name:"asc"}}),
    db.studentProfile.findMany({include:{user:{select:{name:true}}},
      orderBy:{user:{name:"asc"}}}),
  ]);
  return <AdminCreatePage back="/administrador/responsaveis" eyebrow="GESTÃO FAMILIAR"
    title="Vincular aluno" description="Relacione um aluno ao responsável que poderá acompanhar seu desempenho.">
    <GuardianLinkForm guardians={guardians} students={students.map(s=>({
      id:s.id,name:s.nickname||s.user.name,
    }))}/>
  </AdminCreatePage>;
}
