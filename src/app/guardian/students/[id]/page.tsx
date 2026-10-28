import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen, CalendarClock, CheckCircle2, Clock3, Route } from "lucide-react";
import { requireGuardian, linkedStudent, childOverview } from "@/lib/guardian";
import { formatDueDate } from "@/lib/finance";

export const metadata = { title: "Progresso do aluno" };
export default async function GuardianStudentDetail({ params }: {
  params: Promise<{ id: string }>;
}) {
  const guardian = await requireGuardian();
  const { id } = await params;
  const link = await linkedStudent(guardian.id, id);
  if (!link) notFound();
  const { student } = link;
  const overview = await childOverview(student.id);
  return <div className="guardian-stack">
    <Link className="guardian-back" href="/guardian/students"><ArrowLeft size={17}/> Meus alunos</Link>
    <div className="guardian-student-hero">
      <span className="guardian-student-emoji">{student.selectedAvatar || "🎓"}</span>
      <div><p className="guardian-eyebrow">EVOLUÇÃO ESCOLAR</p><h1>{student.nickname || student.user.name}</h1>
        <p>{student.classrooms.map(c => c.classroom.name).join(" · ") || "Estudo individual"}</p></div>
    </div>
    <div className="guardian-metrics">
      <div><Route size={23}/><strong>{overview.percent}%</strong><span>Trilhas disponíveis concluídas</span></div>
      <div><BookOpen size={23}/><strong>{overview.completed}/{overview.total}</strong><span>Lições concluídas</span></div>
      <div><Clock3 size={23}/><strong>{overview.recentWeekCount}</strong><span>Concluídas nos últimos 7 dias</span></div>
    </div>
    <div className="guardian-info-strip"><CheckCircle2 size={20}/><span>{overview.activityText}. {overview.activity.length ? `Há ${overview.activity.length} atividade(s) pendente(s).` : "Sem atividades pendentes."}</span></div>
    <section className="guardian-section">
      <div className="guardian-section-title"><div><p className="guardian-eyebrow">TRILHAS DE ENSINO</p><h2>Acompanhamento das trilhas</h2></div></div>
      {overview.learning.roots.length ? <div className="guardian-path-list">
        {overview.learning.roots.map(path => <div className="guardian-path-card" key={path.id}>
          <span className="guardian-path-icon">{path.icon}</span><div className="guardian-path-content">
            <div><strong>{path.title}</strong><span>{path.completed}/{path.total} lições</span></div>
            <p>{path.description}</p>
            <div className="guardian-progress-track"><span style={{ width: `${path.percent}%` }}/></div>
            <small>{path.percent}% concluído</small>
            {path.children.length > 0 && <div className="guardian-subpaths">{path.children.map(child =>
              <span key={child.id}>{child.icon} {child.title}: {child.percent}%</span>)}</div>}
          </div>
        </div>)}
      </div> : <div className="guardian-empty">Nenhuma trilha publicada ou atribuída ao aluno.</div>}
    </section>
    <section className="guardian-section">
      <div className="guardian-section-title"><div><p className="guardian-eyebrow">ATIVIDADES DA ESCOLA</p><h2>Para entregar</h2></div></div>
      {overview.activity.length ? <div className="guardian-simple-list">
        {overview.activity.map(a => <div key={a.id}>
          <span className="guardian-list-icon"><CalendarClock size={20}/></span>
          <div><strong>{a.lesson.title}</strong>
            <small>Prazo: {formatDueDate(a.dueAt)}{a.dueAt < new Date() ? " · Prazo vencido" : ""}</small></div>
        </div>)}
      </div> : <div className="guardian-empty compact">Nenhuma atividade pendente.</div>}
    </section>
    <section className="guardian-section">
      <div className="guardian-section-title"><div><p className="guardian-eyebrow">HISTÓRICO REAL</p><h2>Últimas lições concluídas</h2></div></div>
      {overview.recent.length ? <div className="guardian-simple-list">
        {overview.recent.map(c => <div key={c.id}>
          <span className="guardian-list-icon">{c.lesson.icon}</span>
          <div><strong>{c.lesson.title}</strong><small>Concluída em {formatDueDate(c.completedAt)} · {c.score}% de acerto</small></div>
          <CheckCircle2 size={19} className="guardian-success-icon"/>
        </div>)}
      </div> : <div className="guardian-empty compact">O aluno ainda não concluiu nenhuma lição.</div>}
    </section>
  </div>;
}
