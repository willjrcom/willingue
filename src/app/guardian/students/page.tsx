import Link from "next/link";
import { ArrowRight, BookOpen, UsersRound } from "lucide-react";
import { requireGuardian, guardianChildren, childOverview } from "@/lib/guardian";

export const metadata = { title: "Aprendizado dos alunos" };
export default async function GuardianStudents() {
  const guardian = await requireGuardian();
  const links = await guardianChildren(guardian.id);
  const children = await Promise.all(links.map(async link => ({
    student: link.student, overview: await childOverview(link.studentId),
  })));
  return <div className="guardian-stack">
    <div className="guardian-page-title"><p className="guardian-eyebrow">APRENDIZADO</p>
      <h1>Meus alunos</h1><p>Acompanhe o desempenho e as atividades de cada aluno vinculado.</p></div>
    {children.length === 0 ? <div className="guardian-empty"><UsersRound size={35}/>
      <h2>Nenhum aluno associado</h2><p>A escola precisa cadastrar seu vínculo para liberar o acompanhamento.</p></div>
    : <div className="guardian-child-grid">
      {children.map(({ student, overview }) => <article className="guardian-child-card" key={student.id}>
        <div className="guardian-child-head"><span className="guardian-child-avatar">{student.selectedAvatar || "🎓"}</span>
          <div><h3>{student.nickname || student.user.name}</h3>
            <p>{student.classrooms.map(link => link.classroom.name).join(" · ") || "Estudo individual"}</p></div></div>
        <div className="guardian-progress-track"><span style={{ width: `${overview.percent}%` }}/></div>
        <div className="guardian-progress-meta"><strong>{overview.percent}% concluído</strong>
          <span>{overview.completed}/{overview.total} lições</span></div>
        <div className="guardian-small-stats"><span><BookOpen size={16}/> {overview.recentWeekCount} nos últimos 7 dias</span>
          <span>{overview.activity.length} atividades pendentes</span></div>
        <Link href={`/guardian/students/${student.id}`} className="guardian-card-link">
          Detalhes do aprendizado <ArrowRight size={17}/></Link>
      </article>)}
    </div>}
  </div>;
}
