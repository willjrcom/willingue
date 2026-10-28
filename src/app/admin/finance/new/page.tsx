import { db } from "@/lib/db";
import { AdminCreatePage, ChargeRegistrationForm } from "@/components/admin-create-forms";
export const metadata={title:"Nova cobrança"};
export default async function RegisterCharge({searchParams}:{
  searchParams:Promise<{aluno?:string}>;
}){
  const params=await searchParams;
  const students=await db.studentProfile.findMany({
    include:{user:{select:{name:true}},
      guardianLinks:{include:{guardian:{select:{name:true,role:true}}}}},
    orderBy:{user:{name:"asc"}},
  });
  return <AdminCreatePage back="/admin/finance" eyebrow="CONTROLE FINANCEIRO"
    title="Nova cobrança" description="Informe valor, vencimento, aluno e quem será responsável pelo pagamento.">
    <ChargeRegistrationForm initialStudentId={students.some(s=>s.id===params.aluno)?params.aluno:undefined}
      students={students.map(s=>({id:s.id,name:s.nickname||s.user.name,
        guardians:s.guardianLinks.filter(g=>g.guardian.role==="GUARDIAN").map(g=>({
          id:g.guardianId,name:g.guardian.name,preferred:g.financialResponsible,
        })),
      }))}/>
  </AdminCreatePage>;
}
