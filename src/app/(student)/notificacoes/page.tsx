import { requireStudent } from "@/lib/auth";
import { db } from "@/lib/db";
import { NotificationsList } from "@/components/notifications-list";
export const metadata = { title: "Notificações" };
export default async function NotificationsPage() {
  const { user } = await requireStudent();
  const data = await db.notification.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 50 });
  return <div className="page-stack"><div className="page-title"><div><p className="eyebrow muted">FIQUE POR DENTRO</p><h1>Notificações <span>🔔</span></h1><p>Novidades, lembretes e conquistas.</p></div></div><NotificationsList items={data.map(n=>({ id:n.id,title:n.title,message:n.message,href:n.href,read: Boolean(n.readAt),date:n.createdAt.toLocaleDateString("pt-BR",{day:"2-digit",month:"short",year:"numeric"}) }))}/></div>;
}
