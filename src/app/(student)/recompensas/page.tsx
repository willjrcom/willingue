import { requireStudent } from "@/lib/auth";
import { db } from "@/lib/db";
import { RewardShop } from "@/components/reward-shop";
export const metadata = { title: "Recompensas" };
export default async function RewardsPage() {
  const { student } = await requireStudent();
  const [rewards,redemptions]=await Promise.all([
    db.reward.findMany({ where: { active: true }, orderBy: [{ position:"asc" },{name:"asc"}] }),
    db.rewardRedemption.findMany({ where: { studentId: student.id }, select: { rewardId: true } }),
  ]);
  return <div className="page-stack"><div className="page-title"><div><p className="eyebrow muted">VOCÊ MERECE!</p><h1>Recompensas <span>🎁</span></h1><p>Suas conquistas viram prêmios incríveis.</p></div></div>
    <RewardShop items={rewards.map(r=>({id:r.id,name:r.name,description:r.description,icon:r.icon,price:r.price,category:r.category}))} unlocked={redemptions.map(r=>r.rewardId)} initialCoins={student.coins} currentAvatar={student.selectedAvatar}/>
  </div>;
}
