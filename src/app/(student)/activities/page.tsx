import Link from "next/link";
import { ArrowRight, CalendarCheck, CalendarDays, CheckCircle2, Clock3 } from "lucide-react";
import { requireStudent } from "@/lib/auth";
import { db } from "@/lib/db";
import { resolveExperience } from "@/lib/student-experience";

export const metadata = { title: "Atividades" };
export default async function ActivitiesPage() {
  const { student } = await requireStudent();
  const experience = resolveExperience(student);
  const tasks = await db.activity.findMany({ where: { studentId: student.id }, include: { lesson: true }, orderBy: { dueAt: "asc" } });
  const pending = tasks.filter(a => !a.completedAt);
  const finished = tasks.filter(a => Boolean(a.completedAt));
  return <div className="page-stack"><div className="page-title"><div><p className="eyebrow muted">ORGANIZE SEUS ESTUDOS</p><h1>Minhas atividades {experience === "kids" && <span>📝</span>}</h1><p>{experience === "adult" ? "Acompanhe atividades, prazos e entregas." : experience === "teen" ? "Suas atividades, tudo em um só lugar." : "Veja o que seu professor preparou para você."}</p></div></div>
    <div className="activity-overview"><div className="activity-overview-icon"><CalendarDays size={28}/></div><div><strong>{pending.length} atividades pendentes</strong><p>{experience === "adult" ? "Confira os prazos das atividades." : experience === "teen" ? "Organize seu ritmo de estudos." : "Você consegue! Faça uma de cada vez. 💜"}</p></div></div>
    <section className="section-block"><div className="section-heading"><h2>Para fazer</h2><span className="heading-counter">{pending.length}</span></div><div className="activity-list">{pending.length ? pending.map(activity=><Link key={activity.id} href={`/licoes/${activity.lessonId}`} className="activity-card"><div className="activity-emoji">{activity.lesson.icon}</div><div><strong>{activity.lesson.title}</strong><p>{activity.lesson.description}</p><small className={activity.dueAt < new Date() ? "late" : ""}><Clock3 size={14}/> {activity.dueAt < new Date() ? "Atrasada · " : "Entrega até "}{activity.dueAt.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}</small></div><ArrowRight size={20}/></Link>) : <div className="empty-card"><span>🎉</span><h3>Tudo em dia!</h3><p>Você não tem atividades pendentes.</p></div>}</div></section>
    <section className="section-block"><div className="section-heading"><h2>Concluídas</h2><span className="heading-counter">{finished.length}</span></div><div className="activity-list">{finished.length ? finished.map(activity=><div key={activity.id} className="activity-card done"><div className="activity-emoji"><CheckCircle2 size={25}/></div><div><strong>{activity.lesson.title}</strong><p>Concluída em {activity.completedAt?.toLocaleDateString("pt-BR")}</p></div><CalendarCheck size={23}/></div>) : <p className="muted-note">As atividades concluídas aparecerão aqui.</p>}</div></section>
  </div>;
}
