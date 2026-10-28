import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowRight, Check, LockKeyhole, Play } from "lucide-react";
import type { TrailNode } from "@/lib/learning";
import { ProgressRing } from "@/components/progress-ring";

export function TrailOverview({ nodes }: { nodes: TrailNode[] }) {
  if (!nodes.length) return <section className="empty-card"><span>🧭</span><h3>Sua jornada está começando</h3><p>Assim que a escola publicar suas trilhas, elas aparecerão aqui.</p></section>;
  return <div className="trail-grid">{nodes.map(node => <Link href={`/paths/${node.id}`} className="trail-summary" key={node.id}>
    <div className="trail-summary-top"><span className="trail-icon" style={{ background: `${node.color}1c` }}>{node.icon}</span><ProgressRing value={node.percent} size={67} stroke={7} color={node.color}/></div>
    <h3>{node.title}</h3><p>{node.description}</p><div className="trail-summary-foot"><span>{node.completed}/{node.total} lições</span><span className="round-arrow"><ArrowRight size={18}/></span></div>
  </Link>)}</div>;
}

export function VerticalTrail({ node }: { node: TrailNode }) {
  const steps: Array<{ id: string; type: "path" | "lesson"; title: string; subtitle: string; icon: string; color: string; done: boolean; href: string }> = [
    ...node.children.map(child => ({ id: child.id, type: "path" as const, title: child.title, subtitle: `${child.completed}/${child.total} lições concluídas`, icon: child.icon, color: child.color, done: child.total > 0 && child.percent === 100, href: `/paths/${child.id}` })),
    ...node.lessons.map(lesson => ({ id: lesson.id, type: "lesson" as const, title: lesson.title, subtitle: lesson.done ? "Concluída!" : `+${lesson.xpReward} XP · +${lesson.coinReward} moedas`, icon: lesson.icon, color: "#7563eb", done: lesson.done, href: `/lessons/${lesson.id}` })),
  ];
  if (!steps.length) return <div className="empty-card">Nenhuma atividade publicada nesta trilha ainda.</div>;
  return <div className="vertical-trail"><div className="trail-vertical-line" aria-hidden="true"/>{steps.map((step, index) => <Link key={step.id} href={step.href} className={`journey-step position-${index%3}`}>
    <div className={`journey-bubble ${step.done ? "complete" : ""}`} style={{ "--bubble-color": step.color } as CSSProperties}>
      {step.done ? <Check size={32} strokeWidth={3}/> : <span>{step.icon}</span>}
    </div><div className="journey-card"><div className="step-kind">{step.type === "path" ? "SUBTRILHA" : "LIÇÃO"}</div><strong>{step.title}</strong><small>{step.subtitle}</small></div>
    <span className="step-go" aria-hidden="true">{step.done ? <Check size={17}/> : step.type === "lesson" ? <Play size={16} fill="currentColor"/> : <ArrowRight size={17}/>}</span>
  </Link>)}</div>;
}
