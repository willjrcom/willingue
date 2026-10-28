import { db } from "@/lib/db";
import { AdminCreatePage, StudentRegistrationForm } from "@/components/admin-create-forms";

export const metadata={title:"Cadastrar aluno"};
export default async function RegisterStudent(){
  const classes=await db.classroom.findMany({where:{active:true},orderBy:{name:"asc"},
    select:{id:true,name:true}});
  return <AdminCreatePage back="/administrador/alunos" eyebrow="GESTÃO ACADÊMICA"
    title="Cadastrar aluno" description="Crie o acesso de um novo estudante.">
    <StudentRegistrationForm classrooms={classes}/>
  </AdminCreatePage>;
}
