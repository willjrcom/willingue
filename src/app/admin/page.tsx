import Link from "next/link";
import { ArrowRight, BookOpen, ChartNoAxesCombined, CheckCircle2, CircleAlert, CreditCard, GraduationCap, Layers3, Sparkles, TrendingUp, UsersRound, Wallet } from "lucide-react";
import { db } from "@/lib/db";
import { chargeStatus, formatMoney, sumCharges } from "@/lib/finance";

export const metadata = { title: "Painel administrativo" };

export default async function AdminPage() {
  const now = new Date();
  const week = new Date(now.getTime() - 7 * 86400000);
  const [
    students, guardians, classes, paths, lessons, totalCompleted,
    completedWeek, openCharges, recentCompletions, recentCharges, finished,
  ] = await Promise.all([
    db.studentProfile.count(),
    db.user.count({ where: { role: "GUARDIAN" } }),
    db.classroom.count({ where: { active: true } }),
    db.learningPath.count({ where: { published: true } }),
    db.lesson.count({ where: { published: true } }),
    db.lessonCompletion.count(),
    db.lessonCompletion.count({ where: { completedAt: { gte: week } } }),
    db.charge.findMany({ where: { status: "PENDING" }, select: { amountCents: true, dueAt: true, status: true } }),
    db.lessonCompletion.findMany({
      include: { student: { include: { user: { select: { name: true } } } },
        lesson: { select: { title: true, icon: true } } },
      orderBy: { completedAt: "desc" }, take: 6,
    }),
    db.charge.findMany({
      where: { status: "PENDING" }, orderBy: { dueAt: "asc" }, take: 5,
      include: { student: { include: { user: { select: { name: true } } } } },
    }),
    db.lessonCompletion.groupBy({ by: ["studentId"], _count: { _all: true } }),
  ]);
  const overdue = openCharges.filter(c => chargeStatus(c, now) === "OVERDUE");
  const inactiveStudents = Math.max(0, students - finished.length);
  const cards = [
    { label: "Alunos", value: students.toLocaleString("pt-BR"), hint: `${guardians} responsáveis`, icon: GraduationCap, href: "/admin/students", tone: "purple" },
    { label: "Turmas ativas", value: classes.toLocaleString("pt-BR"), hint: `${paths} trilhas publicadas`, icon: UsersRound, href: "/admin/classrooms", tone: "blue" },
    { label: "Lições esta semana", value: completedWeek.toLocaleString("pt-BR"), hint: `${totalCompleted} concluídas no total`, icon: BookOpen, href: "/admin/reports", tone: "mint" },
    { label: "A receber", value: formatMoney(sumCharges(openCharges)), hint: `${overdue.length} cobrança(s) atrasada(s)`, icon: Wallet, href: "/admin/finance", tone: "orange" },
  ];
  return <div className="admin-content">
    <div className="admin-welcome">
      <div><p className="admin-eyebrow">SEU PAINEL ESCOLAR</p><h1>Visão geral <span>✦</span></h1>
        <p>Uma visão completa do aprendizado, das turmas e da operação da escola.</p></div>
      <Link className="admin-action-primary" href="/admin/students"><GraduationCap size={17}/> Gerenciar alunos <ArrowRight size={17}/></Link>
    </div>
    <section className="admin-dash-cards" aria-label="Indicadores principais">
      {cards.map(card => { const Icon = card.icon; return <Link href={card.href} className="admin-dash-card" key={card.label}>
        <span className={`admin-dash-icon ${card.tone}`}><Icon size={23}/></span>
        <small>{card.label}</small><strong>{card.value}</strong><span className="admin-dash-hint">{card.hint}</span>
      </Link>; })}
    </section>
    <div className="admin-dashboard-columns">
      <section className="admin-panel">
        <div className="admin-panel-heading"><div><p className="admin-eyebrow">ATIVIDADE RECENTE</p><h2>Últimas lições</h2></div>
          <Link href="/admin/reports">Relatórios <ArrowRight size={16}/></Link></div>
        {recentCompletions.length ? <div className="admin-dash-activity">
          {recentCompletions.map(c => <div key={c.id}>
            <span className="admin-dash-activity-icon">{c.lesson.icon}</span>
            <span><strong>{c.student.nickname || c.student.user.name}</strong>
              <small>Concluiu {c.lesson.title}</small></span>
            <time>{c.completedAt.toLocaleDateString("pt-BR")}</time>
          </div>)}
        </div> : <div className="admin-inline-empty">Ainda não há lições concluídas.</div>}
      </section>
      <section className="admin-panel">
        <div className="admin-panel-heading"><div><p className="admin-eyebrow">FINANCEIRO</p><h2>Próximos vencimentos</h2></div>
          <Link href="/admin/finance">Ver contas <ArrowRight size={16}/></Link></div>
        {recentCharges.length ? <div className="admin-dash-activity">
          {recentCharges.map(c => <div key={c.id}>
            <span className="admin-dash-activity-icon"><CreditCard size={20}/></span>
            <span><strong>{c.student.nickname || c.student.user.name}</strong><small>{c.title}</small></span>
            <span className="admin-money-item">{formatMoney(c.amountCents)}</span>
          </div>)}
        </div> : <div className="admin-inline-empty">Nenhuma cobrança pendente.</div>}
      </section>
    </div>
    <section className="admin-dash-insights">
      <div><span><TrendingUp size={21}/></span><strong>{lessons}</strong><small>Lições disponíveis</small></div>
      <div><span><CheckCircle2 size={21}/></span><strong>{finished.length}</strong><small>Alunos com progresso</small></div>
      <div><span><CircleAlert size={21}/></span><strong>{inactiveStudents}</strong><small>Ainda sem lições concluídas</small></div>
      <div><span><Layers3 size={21}/></span><strong>{paths}</strong><small>Trilhas publicadas</small></div>
    </section>
    <div className="admin-section-links">
      <Link href="/admin/learning"><Sparkles size={19}/> Gerenciar aprendizado <ArrowRight size={16}/></Link>
      <Link href="/admin/rewards"><Layers3 size={19}/> Loja de recompensas <ArrowRight size={16}/></Link>
      <Link href="/admin/reports"><ChartNoAxesCombined size={19}/> Relatórios <ArrowRight size={16}/></Link>
    </div>
  </div>;
}
