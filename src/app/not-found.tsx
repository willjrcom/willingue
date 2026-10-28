import Link from "next/link";
import { currentUser } from "@/lib/auth";
import { resolveExperience } from "@/lib/student-experience";
import { BrandMark } from "@/components/brand-mark";
import { AdminNavigation } from "@/components/admin-navigation";
import { GuardianNav } from "@/components/guardian-nav";
import { StudentNav } from "@/components/student-nav";
import { ErrorPanel } from "@/components/error-panel";

export default async function GlobalNotFound(){
 const user=await currentUser();
 const role=user?.role;
 if(role==="ADMIN")return <div className="admin-workspace">
  <AdminNavigation adminName={user.name} email={user.email}/>
  <main className="admin-workspace-main"><div className="admin-content"><ErrorPanel
   code="404" title="Página não encontrada" description="Escolha outra área no menu de administração."
   home="/administrador"/></div></main></div>;
 if(role==="GUARDIAN")return <div className="guardian-shell">
  <header className="guardian-topbar"><Link href="/responsavel" className="guardian-brand">
   <BrandMark size={37}/> Willingue<b>.</b></Link></header>
  <main className="guardian-container"><ErrorPanel code="404" title="Página não encontrada"
   description="Esta página não existe. Você pode acessar as outras áreas pelo menu." home="/responsavel"/></main>
  <GuardianNav/></div>;
 if(role==="STUDENT"&&user.student){
  const mode=resolveExperience(user.student);
  return <div className={`app-shell experience-${mode}`}>
   <header className="topbar"><Link href="/aprender" className="brand"><BrandMark size={42}/> Willingue.</Link></header>
   <main className="page-container"><ErrorPanel code="404" title="Não encontramos essa página"
    description="Continue aprendendo pelo menu abaixo." home="/aprender"/></main>
   <StudentNav experience={mode}/></div>;
 }
 return <main className="willingue-guest-error">
  <Link href="/login" className="willingue-error-brand"><BrandMark size={50}/> Willingue.</Link>
  <ErrorPanel code="404" title="Endereço não encontrado"
   description="Esta página não existe ou foi movida." home="/login"/>
 </main>;
}
