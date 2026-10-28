import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, ClipboardList, CreditCard, GraduationCap, Layers, Sparkles, UsersRound } from "lucide-react";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { LogoutButton } from "@/components/logout-button";

export const metadata = { title: "Administração" };

export default async function AdminPage() {
  const user = await currentUser();
  if (!user || user.role !== "ADMIN") redirect("/login");
  const [studentCount, classroomCount] = await Promise.all([
    db.studentProfile.count(),
    db.classroom.count({ where: { active: true } }),
  ]);
  return <main className="admin-page">
    <header className="admin-header">
      <Link className="admin-brand" href="/administrador"><Sparkles size={26}/> Willingue<span>.</span></Link>
      <LogoutButton/>
    </header>
    <div className="admin-container">
      <div className="admin-intro"><p className="eyebrow muted">ADMINISTRAÇÃO ESCOLAR</p>
        <h1>Olá, {user.name}!</h1>
        <p>Organize as turmas, acompanhe os alunos e prepare suas próximas aulas.</p>
      </div>
      <div className="admin-stat-grid">
        <div className="admin-stat"><GraduationCap size={26}/><strong>{studentCount}</strong><span>Alunos cadastrados</span></div>
        <div className="admin-stat"><UsersRound size={26}/><strong>{classroomCount}</strong><span>Turmas ativas</span></div>
      </div>
      <section className="admin-section">
        <div><h2>Gestão de turmas</h2><p>Cadastre turmas, vincule alunos e acompanhe os rankings de lições concluídas.</p></div>
        <Link href="/administrador/turmas" className="primary-button">Gerenciar turmas <ArrowRight size={18}/></Link>
      </section>
      <section className="admin-section">
        <div><h2>Responsáveis</h2><p>Crie acessos e vincule responsáveis aos alunos, indicando quem pode responder financeiramente.</p></div>
        <Link href="/administrador/responsaveis" className="primary-button">Gerenciar responsáveis <ArrowRight size={18}/></Link>
      </section>
      <section className="admin-section">
        <div><h2>Financeiro escolar</h2><p>Cadastre cobranças, escolha o pagante e registre os pagamentos recebidos.</p></div>
        <Link href="/administrador/financeiro" className="primary-button"><CreditCard size={18}/> Abrir financeiro <ArrowRight size={18}/></Link>
      </section>
      <div className="admin-planned">
        <div><Layers size={24}/><strong>Trilhas e conteúdo</strong><span>Editor administrativo em desenvolvimento</span></div>
        <div><ClipboardList size={24}/><strong>Relatórios</strong><span>Relatórios consolidados em desenvolvimento</span></div>
      </div>
    </div>
  </main>;
}
