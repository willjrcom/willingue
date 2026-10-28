import { Coins, Gift, ShoppingBag, Star } from "lucide-react";
import { db } from "@/lib/db";
import { AdminRewardManager } from "@/components/admin-reward-manager";

export const metadata = { title: "Recompensas" };
export default async function AdminRewardsPage() {
  const [items, totalRedemptions] = await Promise.all([
    db.reward.findMany({ include: { _count: { select: { redemptions: true } } },
      orderBy: [{ position: "asc" }, { name: "asc" }] }),
    db.rewardRedemption.count(),
  ]);
  return <div className="admin-content">
    <div className="admin-page-heading"><div><p className="admin-eyebrow">GAMIFICAÇÃO E ENGAJAMENTO</p>
      <h1>Recompensas</h1><p>Cadastre a loja de prêmios digitais e defina quantas moedas cada item custa.</p></div></div>
    <div className="admin-dash-insights">
      <div><span><Gift size={22}/></span><strong>{items.length}</strong><small>Itens cadastrados</small></div>
      <div><span><ShoppingBag size={22}/></span><strong>{items.filter(item=>item.active).length}</strong><small>Disponíveis na loja</small></div>
      <div><span><Star size={22}/></span><strong>{totalRedemptions}</strong><small>Resgates registrados</small></div>
      <div><span><Coins size={22}/></span><strong>{items.length?Math.round(items.reduce((n,item)=>n+item.price,0)/items.length):0}</strong><small>Preço médio em moedas</small></div>
    </div>
    <AdminRewardManager items={items.map(item=>({
      id:item.id,name:item.name,description:item.description,icon:item.icon,
      category:item.category,price:item.price,active:item.active,position:item.position,
      redemptions:item._count.redemptions,
    }))}/>
  </div>;
}
