import { AdminCreatePage, ClassroomRegistrationForm } from "@/components/admin-create-forms";
export const metadata={title:"Nova turma"};
export default function RegisterClassroom(){
  return <AdminCreatePage back="/administrador/turmas" eyebrow="GESTÃO DE TURMAS"
    title="Nova turma" description="Cadastre uma turma e organize os participantes em seguida.">
    <ClassroomRegistrationForm/>
  </AdminCreatePage>;
}
