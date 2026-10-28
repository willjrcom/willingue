import Link from "next/link";
import { ArrowRight, BadgeCheck, BookOpen, CalendarCheck2, CreditCard, TrendingUp, UsersRound } from "lucide-react";
import { requireGuardian, guardianChildren, childOverview } from "@/lib/guardian";
import { db } from "@/lib/db";
import { formatMoney, chargeStatus, sumCharges } from "@/lib/finance";

export const metadata = { title: "Visão geral" };

export default async function GuardianHome() {
  const guardian = await requireGuardian();
  const links = await guardianChildren(guardian.id);
  const children = await Promise.all(links.map(async link => ({
    child: link.student,
    overview: await childOverview(link.student.id),
  })));
  const charges = links.length
    ? await db.charge.findMany({ where: { studentId: { in: links.map(l => l.studentId) } } })
    : [];
  const due = sumCharges(charges.filter(c => ["PENDING","OVERDUE"].includes(chargeStatus(c))));
  const overdueCount = charges.filter(c => chargeStatus(c) === "OVERDUE").length;
  return <div className="guardian-stack">
    <header className="guardian-greeting">
      <p className="guardian-eyebrow">ACOMPANHAMENTO ESCOLAR</p>
      <h1>Olá, {guardian.name.split(" ")[0]}!</h1>
      <p>Veja o que os alunos estão aprendendo e acompanhe as próximas responsabilidades da escola.</p>
    </header>
    {!children.length ? <div className="guardian-empty">
      <UsersRound size={36}/><h2>Nenhum aluno vinculado</h2>
      <p>Peça à escola para associar os alunos ao seu cadastro. Você poderá acompanhar as lições e cobranças aqui.</p>
    </div> : <>
      <section className="guardian-hero">
        <div><span className="guardian-hero-tag"><BadgeCheck size={16}/> ACOMPANHE DE PERTO</span>
          <h2>Aprender juntos faz a diferença.</h2>
          <p>Seu painel reúne o progresso escolar e os avisos financeiros dos alunos vinculados.</p></div>
        <div className="guardian-hero-icon" aria-hidden="true">📚</div>
      </section>
      <section className="guardian-metrics" aria-label="Resumo">
        <div><UsersRound size={23}/><strong>{children.length}</strong><span>{children.length === 1 ? "Aluno acompanhado" : "Alunos acompanhados"}</span></div>
        <div><BookOpen size={23}/><strong>{children.reduce((sum, c) => sum + c.overview.completed, 0)}</strong><span>Lições concluídas</span></div>
        <div><CreditCard size={23}/><strong className="guardian-money">{formatMoney(due)}</strong><span>{overdueCount ? `${overdueCount} cobrança(s) atrasada(s)` : "Em aberto"}</span></div>
      </section>
      <section className="guardian-section">
        <div className="guardian-section-title"><div><p className="guardian-eyebrow">EVOLUÇÃO INDIVIDUAL</p><h2>Meus alunos</h2></div>
          <Link href="/responsavel/alunos">Ver todos <ArrowRight size={16}/></Link></div>
        <div className="guardian-child-grid">
          {children.map(({ child, overview }) => <article className="guardian-child-card" key={child.id}>
            <div className="guardian-child-head"><span className="guardian-child-avatar">{child.selectedAvatar || "🎓"}</span>
              <div><h3>{child.nickname || child.user.name}</h3><p>{child.classrooms.map(m => m.classroom.name).join(" · ") || "Estudo individual"}</p></div></div>
            <div className="guardian-progress-track"><span style={{ width: `${overview.percent}%` }}/></div>
            <div className="guardian-progress-meta"><strong>{overview.percent}% do conteúdo disponível</strong>
              <span>{overview.completed}/{overview.total} lições</span></div>
            <p className="guardian-activity-hint">{overview.activityText}</p>
            <Link className="guardian-card-link" href={`/responsavel/alunos/${child.id}`}>Ver aprendizado <ArrowRight size={17}/></Link>
          </article>)}
        </div>
      </section>
      <div className="guardian-highlight-row">
        <Link href="/responsavel/alunos" className="guardian-highlight"><TrendingUp size={26}/>
          <span><strong>Progresso escolar</strong><small>Trilhas, atividades e histórico das lições.</small></span><ArrowRight size={18}/></Link>
        <Link href="/responsavel/financeiro" className="guardian-highlight"><CalendarCheck2 size={26}/>
          <span><strong>Financeiro</strong><small>Vencimentos, cobranças e pagamentos registrados.</small></span><ArrowRight size={18}/></Link>
      </div>
    </>}
  </div>;
}
