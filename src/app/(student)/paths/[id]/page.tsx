import Link from "next/link";
import type { CSSProperties } from "react";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { notFound } from "next/navigation";
import { requireStudent } from "@/lib/auth";
import { findTrailBreadcrumbs, loadStudentLearning } from "@/lib/learning";
import { ProgressRing } from "@/components/progress-ring";
import { VerticalTrail } from "@/components/trail-map";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) { return { title: "Minha trilha" }; }
export default async function PathPage({ params }: { params: Promise<{ id: string }> }) {
  const { student } = await requireStudent();
  const learning = await loadStudentLearning(student.id);
  const { id } = await params;
  const crumbs = findTrailBreadcrumbs(learning.roots, id);
  if (!crumbs) notFound();
  const trail = crumbs[crumbs.length - 1];
  const back = crumbs.length > 1 ? `/paths/${crumbs[crumbs.length - 2].id}` : "/learn";
  return <div className="page-stack trail-page">
    <Link className="back-link" href={back}><ChevronLeft size={19}/> Voltar para {crumbs.length > 1 ? "a trilha anterior" : "minhas trilhas"}</Link>
    <div className="breadcrumbs"><Link href="/learn">Aprender</Link>{crumbs.map(p => <span key={p.id}><ChevronRight size={13}/><span>{p.title}</span></span>)}</div>
    <section className="trail-hero" style={{ "--trail-color": trail.color } as CSSProperties}>
      <div className="trail-hero-content"><p className="eyebrow">SUA JORNADA DE APRENDIZADO</p><div className="trail-hero-icon">{trail.icon}</div><h1>{trail.title}</h1><p>{trail.description}</p><span className="trail-lessons-count"><Sparkles size={16}/> {trail.completed} de {trail.total} lições concluídas</span></div>
      <div className="trail-ring"><ProgressRing value={trail.percent} size={116} stroke={12} color={trail.color}/></div>
    </section>
    <div className="section-heading"><div><p className="eyebrow muted">UM PASSO DE CADA VEZ</p><h2>Seu caminho <span>🚀</span></h2></div></div>
    <VerticalTrail node={trail}/>
  </div>;
}
