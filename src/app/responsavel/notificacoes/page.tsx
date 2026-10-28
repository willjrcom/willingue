import { requireGuardian } from "@/lib/guardian";
import { db } from "@/lib/db";
import { NotificationsList } from "@/components/notifications-list";

export const metadata = { title: "Notificações" };
export default async function GuardianNotifications() {
  const user = await requireGuardian();
  const notifications = await db.notification.findMany({
    where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 50,
  });
  return <div className="guardian-stack"><div className="guardian-page-title">
    <p className="guardian-eyebrow">AVISOS IMPORTANTES</p><h1>Notificações</h1></div>
    <NotificationsList items={notifications.map(item => ({
      id: item.id, title: item.title, message: item.message, href: item.href,
      createdAt: item.createdAt.toISOString(), readAt: item.readAt?.toISOString() ?? null,
    }))}/>
  </div>;
}
