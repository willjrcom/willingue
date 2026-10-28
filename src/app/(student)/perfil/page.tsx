import Link from "next/link";
import { BookOpen, ChevronRight, Coins, Medal, Settings2, Star, Trophy } from "lucide-react";
import { requireStudent } from "@/lib/auth";
import { db } from "@/lib/db";
import { levelForXp, loadStudentLearning } from "@/lib/learning";
import { LogoutButton } from "@/components/logout-button";
import { StudentProfileEditor } from "@/components/student-profile-editor";
import { resolveExperience, experienceCopy } from "@/lib/student-experience";

export const metadata = { title: "Meu perfil" };
export default async function ProfilePage() {
  const { user, student } = await requireStudent();
  const level = levelForXp(student.xp);
  const learning = await loadStudentLearning(student.id);
  const completed = learning.roots.reduce((sum, n)=>sum+n.completed,0);
  const [redemptions, avatarRedemptions] = await Promise.all([
    db.rewardRedemption.count({ where: { studentId: student.id } }),
    db.rewardRedemption.findMany({ where: { studentId: student.id, reward: { category: "AVATAR" } }, include: { reward: true } }),
  ]);
  const experience = resolveExperience(student);
  const copy = experienceCopy[experience];
  return <div className="page-stack"><div className="page-title"><div><p className="eyebrow muted">{copy.profileEyebrow}</p><h1>Meu perfil {experience === "kids" && <span>🌟</span>}</h1><p>{copy.profileDescription}</p></div></div>
    <section className="profile-card"><StudentProfileEditor
      name={user.name}
      nickname={student.nickname || ""}
      email={user.email}
      avatar={student.selectedAvatar || "🦊"}
      ownedAvatars={avatarRedemptions.map(redemption => ({ id: redemption.reward.id, name: redemption.reward.name, icon: redemption.reward.icon }))}
    /><h2>{student.nickname || user.name}</h2><p>{user.email}</p><span className="profile-level"><Trophy size={16}/> {copy.levelLabel} {level.level}</span><div className="profile-progress"><div className="profile-progress-label"><span>Rumo ao nível {level.level+1}</span><strong>{student.xp}/{level.nextXp} XP</strong></div><div className="stat-meter"><span style={{ width: `${level.progress}%` }}/></div></div></section>
    <section className="profile-stats"><div><Star size={24}/><strong>{student.xp}</strong><span>XP total</span></div><div><BookOpen size={24}/><strong>{completed}</strong><span>Lições</span></div><div><Coins size={24}/><strong>{student.coins}</strong><span>Moedas</span></div><div><Medal size={24}/><strong>{redemptions}</strong><span>Prêmios</span></div></section>
    <section className="section-block"><div className="section-heading"><h2>Minhas medalhas 🏅</h2></div><div className="badge-grid"><div className={`achievement ${completed ? "earned" : ""}`}><span>🌱</span><strong>Primeiro passo</strong><small>{completed ? "Conquistada" : "Complete sua primeira lição"}</small></div><div className={`achievement ${completed>=3 ? "earned" : ""}`}><span>🚀</span><strong>Desbravador</strong><small>{completed>=3 ? "Conquistada" : "Complete 3 lições"}</small></div><div className={`achievement ${completed>=5 ? "earned" : ""}`}><span>🏆</span><strong>Super aluno</strong><small>{completed>=5 ? "Conquistada" : "Complete 5 lições"}</small></div></div></section>
    <Link href="/preferencias" className="profile-preferences-link">
      <span className="profile-preferences-icon"><Settings2 size={22}/></span>
      <span className="profile-preferences-text"><strong>Preferências</strong><small>Aparência, modo de exibição e data de nascimento</small></span>
      <ChevronRight size={21} aria-hidden="true"/>
    </Link>
    <LogoutButton/>
  </div>;
}
