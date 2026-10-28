import Link from "next/link";
import { UserRound, UsersRound, Mail, ChevronRight } from "lucide-react";
import { requireGuardian, guardianChildren } from "@/lib/guardian";
import { LogoutButton } from "@/components/logout-button";

export const metadata = { title: "Perfil do responsável" };
export default async function GuardianProfile() {
  const user = await requireGuardian();
  const children = await guardianChildren(user.id);
  return <div className="guardian-stack">
    <div className="guardian-page-title"><p className="guardian-eyebrow">MINHA CONTA</p>
      <h1>Meu perfil</h1><p>Dados de acesso e vínculos cadastrados pela escola.</p></div>
    <div className="guardian-person-card"><span className="guardian-person-avatar"><UserRound size={31}/></span>
      <h2>{user.name}</h2><p><Mail size={17}/> {user.email}</p><small>Conta de responsável</small></div>
    <section className="guardian-section">
      <div className="guardian-section-title"><div><p className="guardian-eyebrow">VÍNCULOS</p><h2>Alunos acompanhados</h2></div></div>
      {children.length ? <div className="guardian-simple-list">{children.map(link =>
        <Link key={link.id} href={`/responsavel/alunos/${link.studentId}`}>
          <span className="guardian-list-icon">{link.student.selectedAvatar || "🎓"}</span>
          <div><strong>{link.student.nickname || link.student.user.name}</strong>
            <small>{link.financialResponsible ? "Responsável financeiro" : "Acompanhamento de aprendizado"}</small></div>
          <ChevronRight size={19}/></Link>)}</div> : <div className="guardian-empty compact"><UsersRound size={25}/>
          Nenhum aluno vinculado.</div>}
    </section>
    <LogoutButton/>
  </div>;
}
