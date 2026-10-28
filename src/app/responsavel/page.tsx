import { redirect } from "next/navigation";
import { Bell, BookOpen, Heart, Sparkles } from "lucide-react";
import { currentUser } from "@/lib/auth";
import { LogoutButton } from "@/components/logout-button";

export const metadata = { title: "Responsável" };
export default async function GuardianPage() {
  const user = await currentUser();
  if (!user || user.role !== "GUARDIAN") redirect("/login");
  return <main className="demo-portal">
    <header className="demo-portal-brand"><Sparkles size={23}/> Willingue<span>.</span></header>
    <section className="demo-portal-card"><div className="demo-portal-icon">👨‍👩‍👧</div>
      <span className="demo-portal-eyebrow">PERFIL RESPONSÁVEL</span>
      <h1>Bem-vindo(a), {user.name}!</h1><p>Seu acesso de responsável já funciona. O acompanhamento dos alunos vinculados virá na próxima etapa.</p>
      <div className="demo-portal-features">
        <span><BookOpen size={18}/> Progresso dos filhos</span>
        <span><Heart size={18}/> Atividades e conquistas</span>
        <span><Bell size={18}/> Avisos e cobranças</span>
      </div>
      <LogoutButton/>
    </section>
  </main>;
}
