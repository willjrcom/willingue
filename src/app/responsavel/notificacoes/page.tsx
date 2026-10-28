import { requireGuardian } from "@/lib/guardian";
import { db } from "@/lib/db";
import { NotificationsList } from "@/components/notifications-list";

export const metadata = { title: "Notificações" };
export default async function GuardianNotifications() {
  const user = await requireGuardian();
  const notifications = await db.notification.findMany({
    where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 50,
  });
  return <div className="guardian-stack">
    <div className="guardian-page-title"><p className="guardian-eyebrow">AVISOS IMPORTANTES</p><h1>Notificações</h1></div>
    <NotificationsList items={notifications.map(n => ({
      id: n.id, title: n.title, message: n.message, href: n.href,
      read: Boolean(n.readAt), date: n.createdAt.toLocaleDateString("pt-BR",
        { day: "2-digit", month: "short", year: "numeric" }),
    }))}/>
  </div>;
}
