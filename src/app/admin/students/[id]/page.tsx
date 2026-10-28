import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen, Coins, CreditCard, Mail, UsersRound } from "lucide-react";
import { db } from "@/lib/db";
import { loadStudentLearning } from "@/lib/learning";
import { chargeStatus, formatMoney } from "@/lib/finance";
import { AdminStudentEditor } from "@/components/admin-student-editor";

export const metadata = { title: "Detalhes do aluno" };

export default async function AdminStudentDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const student = await db.studentProfile.findUnique({
    where: { id }, include: { user: true,
      classrooms: { include: { classroom: true } },
      guardianLinks: { include: { guardian: { select: { name: true } } } },
      completions: { include: { lesson: { select: { title: true, icon: true } } },
        orderBy: { completedAt: "desc" }, take: 5 },
      charges: { orderBy: { dueAt: "desc" }, take: 6 },
    },
  });
  if (!student) notFound();
  const learning = await loadStudentLearning(student.id);
  const total = learning.roots.reduce((n,p)=>n+p.total,0);
  const done = learning.roots.reduce((n,p)=>n+p.completed,0);
  const paths = await db.learningPath.findMany({ where: { published: true },
    select: { id: true, title: true, parentId: true }, orderBy: { position: "asc" } });
  const enrollments = await db.pathEnrollment.findMany({ where: { studentId: student.id },
    select: { pathId: true } });
  return <div className="admin-content">
    <Link href="/admin/students" className="admin-back"><ArrowLeft size={17}/> Voltar aos alunos</Link>
    <div className="admin-student-detail-head"><span>{student.selectedAvatar || "🎓"}</span><div>
      <p className="admin-eyebrow">ACOMPANHAMENTO INDIVIDUAL</p><h1>{student.nickname || student.user.name}</h1>
      <p><Mail size={14}/> {student.user.email}</p></div></div>
    <div className="admin-dash-insights">
      <div><span><BookOpen size={21}/></span><strong>{done}/{total}</strong><small>Lições disponíveis concluídas</small></div>
      <div><span><UsersRound size={21}/></span><strong>{student.classrooms.length}</strong><small>Turmas</small></div>
      <div><span><Coins size={21}/></span><strong>{student.coins}</strong><small>Moedas disponíveis</small></div>
      <div><span><CreditCard size={21}/></span><strong>{formatMoney(student.charges.filter(c=>["PENDING","OVERDUE"].includes(chargeStatus(c))).reduce((n,c)=>n+c.amountCents,0))}</strong><small>Em aberto (últimas cobranças)</small></div>
    </div>
    <AdminStudentEditor id={student.id} name={student.user.name} nickname={student.nickname || ""}
      birthDate={student.birthDate?.toISOString().slice(0,10) || ""}
      paths={paths.map(p=>({id:p.id,title:p.title,depth:p.parentId ? 1 : 0}))}
      assigned={enrollments.map(x=>x.pathId)}/>
    <div className="admin-dashboard-columns">
      <section className="admin-panel"><div className="admin-panel-heading"><h2>Trilhas de aprendizado</h2></div>
        {learning.roots.map(p => <div className="admin-path-progress" key={p.id}>
          <div><strong>{p.icon} {p.title}</strong><span>{p.completed}/{p.total} · {p.percent}%</span></div>
          <div className="admin-progress-rail"><span style={{width:`${p.percent}%`}}/></div>
        </div>)}
        {!learning.roots.length && <p className="admin-inline-empty">Nenhuma trilha liberada.</p>}
      </section>
      <section className="admin-panel"><div className="admin-panel-heading"><h2>Últimas lições concluídas</h2></div>
        <div className="admin-dash-activity">{student.completions.map(c=><div key={c.id}>
          <span className="admin-dash-activity-icon">{c.lesson.icon}</span>
          <span><strong>{c.lesson.title}</strong><small>{c.score}% · {c.completedAt.toLocaleDateString("pt-BR")}</small></span>
        </div>)}</div>
        {!student.completions.length && <p className="admin-inline-empty">Nenhuma conclusão registrada.</p>}
      </section>
    </div>
  </div>;
}
