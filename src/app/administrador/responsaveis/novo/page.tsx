import { AdminCreatePage, GuardianRegistrationForm } from "@/components/admin-create-forms";
export const metadata={title:"Cadastrar responsável"};
export default function RegisterGuardian(){
  return <AdminCreatePage back="/administrador/responsaveis" eyebrow="GESTÃO FAMILIAR"
    title="Cadastrar responsável" description="Crie uma conta para acompanhar o desenvolvimento escolar.">
    <GuardianRegistrationForm/>
  </AdminCreatePage>;
}
