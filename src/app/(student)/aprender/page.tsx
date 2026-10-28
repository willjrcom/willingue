import Link from "next/link";
import { ArrowRight, BookOpen, Coins, Flame, Sparkles, Star, Trophy } from "lucide-react";
import { requireStudent } from "@/lib/auth";
import { loadStudentLearning, levelForXp } from "@/lib/learning";
import { TrailOverview } from "@/components/trail-map";

export const metadata = { title: "Aprender" };
export default async function LearnPage() {
  const { user, student } = await requireStudent();
  const learning = await loadStudentLearning(student.id);
  const total = learning.roots.reduce((sum, p) => sum + p.total, 0);
  const completed = learning.roots.reduce((sum, p) => sum + p.completed, 0);
  const level = levelForXp(student.xp);
  const first = learning.roots.find(p=>p.completed<p.total) ?? learning.roots[0];
  const today = new Date().toDateString();
  const studiedToday = student.lastCompletedAt?.toDateString() === today;
  const firstName = (student.nickname || user.name).split(" ")[0];
  return <div className="page-stack">
    <div className="greeting"><div><p className="eyebrow muted">SUA AVENTURA CONTINUA ✨</p><h1>Olá, {firstName}! <span className="wave">👋</span></h1><p>Um pouquinho de inglês por dia faz toda a diferença.</p></div><span className="greeting-emoji">🌈</span></div>
    <section className="welcome-banner"><div className="welcome-copy"><span className="banner-tag"><Sparkles size={14}/> QUE BOM TE VER!</span><h2>Pronto para uma<br/>nova conquista?</h2><p>Cada lição leva você mais longe.</p>{first && <Link className="banner-cta" href={`/trilhas/${first.id}`}>Continuar aprendendo <ArrowRight size={17}/></Link>}</div><div className="welcome-illustration" aria-hidden="true"><span>🦊</span><i className="illustration-star a">✦</i><i className="illustration-star b">✧</i></div></section>
    <section className="stats-grid" aria-label="Seu progresso">
      <div className="stat-card"><div className="stat-icon lavender"><Trophy size={20}/></div><strong>{level.level}</strong><span>Seu nível</span><div className="stat-meter"><span style={{ width: `${level.progress}%` }}/></div></div>
      <div className="stat-card"><div className="stat-icon lemon"><Star size={20}/></div><strong>{student.xp}</strong><span>XP conquistados</span><small>Continue assim! ⭐</small></div>
      <div className="stat-card"><div className="stat-icon mint"><BookOpen size={20}/></div><strong>{completed}<small>/{total}</small></strong><span>Lições feitas</span><small>Uma de cada vez 🚀</small></div>
      <div className="stat-card"><div className="stat-icon peach"><Flame size={20}/></div><strong>{studiedToday ? "Hoje" : "Bora!"}</strong><span>Seu ritmo</span><small>{studiedToday ? "Você estudou hoje!" : "Faça uma lição"}</small></div>
    </section>
    <section className="section-block"><div className="section-heading"><div><p className="eyebrow muted">SEU CAMINHO</p><h2>Minhas trilhas <span>🗺️</span></h2></div><span className="heading-counter">{learning.roots.length} disponíveis</span></div><TrailOverview nodes={learning.roots}/></section>
    <Link className="coin-promo" href="/recompensas"><span className="promo-icon"><Coins size={28}/></span><span><strong>Suas moedas valem prêmios!</strong><small>Desbloqueie avatares, figurinhas e molduras.</small></span><ArrowRight size={20}/></Link>
  </div>;
}
