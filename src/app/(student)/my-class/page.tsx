import Link from "next/link";
import { UsersRound, Trophy, BookOpen, Sparkles, ArrowRight } from "lucide-react";
import { requireStudent } from "@/lib/auth";
import { db } from "@/lib/db";
import { rankClassmates, publicStudentName, startOfSchoolWeek } from "@/lib/classroom-ranking";
import { resolveExperience } from "@/lib/student-experience";

export const metadata = { title: "Minha turma" };

type SearchParams = { turma?: string | string[]; periodo?: string | string[] };

export default async function MyClassPage({ searchParams }: {
  searchParams: Promise<SearchParams>;
}) {
  const { student } = await requireStudent();
  const experience = resolveExperience(student);
  const params = await searchParams;
  const myClasses = await db.classroomMember.findMany({
    where: { studentId: student.id, classroom: { active: true } },
    include: { classroom: true },
    orderBy: { joinedAt: "asc" },
  });
  if (!myClasses.length) {
    return <div className="page-stack">
      <div className="page-title"><p className="eyebrow muted">APRENDA COM SEUS COLEGAS</p>
        <h1>Minha turma {experience === "kids" && "🏫"}</h1>
        <p>Acompanhe o progresso dos colegas da sua turma.</p></div>
      <div className="empty-card"><span>👥</span><h3>Você ainda não está em uma turma</h3>
        <p>Peça à escola para vincular seu cadastro a uma turma. O ranking aparecerá aqui!</p></div>
    </div>;
  }

  const wanted = typeof params.turma === "string" ? params.turma : null;
  // Never allow a requested classroom not enrolled by the authenticated student.
  const current = myClasses.find(item => item.classroomId === wanted) ?? myClasses[0];
  const week = params.periodo !== "geral";
  const members = await db.classroomMember.findMany({
    where: { classroomId: current.classroomId },
    include: { student: { include: { user: { select: { name: true } } } } },
  });
  const ids = members.map(member => member.studentId);
  const completionCounts = await db.lessonCompletion.groupBy({
    by: ["studentId"],
    where: {
      studentId: { in: ids },
      ...(week ? { completedAt: { gte: startOfSchoolWeek() } } : {}),
    },
    _count: { _all: true },
  });
  const counts = new Map(completionCounts.map(count => [count.studentId, count._count._all]));
  const ranking = rankClassmates(members.map(member => ({
    id: member.studentId,
    name: publicStudentName(member.student.nickname, member.student.user.name),
    avatar: member.student.selectedAvatar || "🎓",
    completed: counts.get(member.studentId) ?? 0,
  })));
  const me = ranking.find(member => member.id === student.id)!;
  const href = (classId: string, period: "semana" | "geral") =>
    `/my-class?turma=${encodeURIComponent(classId)}&periodo=${period}`;
  const period = week ? "semana" : "geral";

  return <div className="page-stack">
    <div className="page-title"><div><p className="eyebrow muted">JUNTOS, MAIS LONGE</p>
      <h1>Minha turma {experience === "kids" && <span>🏫</span>}</h1>
      <p>Compare suas lições concluídas e acompanhe sua evolução com os colegas.</p></div></div>
    {myClasses.length > 1 && <nav className="class-choices" aria-label="Escolher turma">
      {myClasses.map(item => <Link key={item.id}
        className={`class-choice${item.id === current.id ? " active" : ""}`}
        href={href(item.classroomId, period)}>{item.classroom.name}</Link>)}
    </nav>}
    <section className="class-banner">
      <div><p className="eyebrow">SUA COMUNIDADE</p>
        <h2>{current.classroom.name}</h2>
        <p>{current.classroom.description || "Estudem juntos e compartilhem conquistas."}</p>
        <p style={{ marginTop: 11, fontWeight: 800 }}><UsersRound size={16} style={{ display: "inline", verticalAlign: "middle" }}/> {members.length} {members.length === 1 ? "participante" : "participantes"}</p>
      </div><span className="class-banner-icon" aria-hidden="true">{experience === "kids" ? "🏆" : "📚"}</span>
    </section>
    <div className="class-personal-summary" aria-label="Sua posição no ranking">
      <div><span>Sua posição {week ? "nesta semana" : "geral"}</span><div><strong>#{me.place}</strong></div></div>
      <div style={{ textAlign: "right" }}><span>Lições concluídas</span><div><strong>{me.completed}</strong></div></div>
    </div>
    <section className="section-block">
      <div className="section-heading"><div><p className="eyebrow muted">COMPETIÇÃO SAUDÁVEL</p>
        <h2><Trophy size={23} style={{ display: "inline", verticalAlign: "middle" }}/> Ranking da turma</h2></div></div>
      <div className="class-ranking-controls" aria-label="Período do ranking">
        <Link href={href(current.classroomId, "semana")} className={`class-period${week ? " active" : ""}`}
          aria-current={week ? "page" : undefined}>Esta semana</Link>
        <Link href={href(current.classroomId, "geral")} className={`class-period${!week ? " active" : ""}`}
          aria-current={!week ? "page" : undefined}>Geral</Link>
      </div>
      <div className="class-leaderboard">
        {ranking.map(member => <div key={member.id}
          className={`class-ranking-row${member.id === student.id ? " is-me" : ""} position-${member.place}`}>
          <span className="class-ranking-position">{member.place <= 3 ? ["🥇","🥈","🥉"][member.place-1] : `#${member.place}`}</span>
          <span className="class-ranking-avatar" aria-hidden="true">{member.avatar}</span>
          <span className="class-ranking-person"><strong>{member.name}{member.id === student.id ? " (você)" : ""}</strong>
            <small>{member.id === student.id ? "Seu progresso" : member.place === 1 ? "Destaque da turma" : "Colega de turma"}</small></span>
          <span className="class-ranking-lessons"><strong>{member.completed}</strong><span>{member.completed === 1 ? "lição" : "lições"}</span></span>
        </div>)}
      </div>
      <p className="class-note"><BookOpen size={15} style={{ display: "inline", verticalAlign: "middle" }}/> Cada lição conta uma única vez. Repetir exercícios não aumenta sua posição. Empates compartilham a mesma colocação.</p>
    </section>
    <Link href="/learn" className="coin-promo"><span className="promo-icon"><Sparkles size={28}/></span>
      <span><strong>Quer subir no ranking?</strong><small>Conclua uma nova lição e acompanhe sua evolução.</small></span>
      <ArrowRight size={20}/></Link>
  </div>;
}
