import { redirect } from "next/navigation";
import { ClipboardList, GraduationCap, Layers, Sparkles } from "lucide-react";
import { currentUser } from "@/lib/auth";
import { LogoutButton } from "@/components/logout-button";

export const metadata = { title: "Administração" };
export default async function AdminPage() {
  const user = await currentUser();
  if (!user || user.role !== "ADMIN") redirect("/login");
  return <main className="demo-portal">
    <header className="demo-portal-brand"><Sparkles size={23}/> Willingue<span>.</span></header>
    <section className="demo-portal-card"><div className="demo-portal-icon">🛠️</div>
      <span className="demo-portal-eyebrow">PERFIL ADMINISTRADOR</span>
      <h1>Olá, {user.name}!</h1><p>Seu acesso administrativo já funciona. O painel de gestão será implementado na próxima etapa.</p>
      <div className="demo-portal-features">
        <span><GraduationCap size={18}/> Gestão de alunos</span>
        <span><Layers size={18}/> Trilhas e atividades</span>
        <span><ClipboardList size={18}/> Financeiro e responsáveis</span>
      </div>
      <LogoutButton/>
    </section>
  </main>;
}
