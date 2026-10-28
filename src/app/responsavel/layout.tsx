import type { ReactNode } from "react";
import Link from "next/link";
import { Bell, Sparkles } from "lucide-react";
import { requireGuardian } from "@/lib/guardian";
import { db } from "@/lib/db";
import { GuardianNav } from "@/components/guardian-nav";

export default async function GuardianLayout({ children }: { children: ReactNode }) {
  const guardian = await requireGuardian();
  const unread = await db.notification.count({ where: { userId: guardian.id, readAt: null } });
  return <div className="guardian-shell">
    <header className="guardian-topbar">
      <Link href="/responsavel" className="guardian-brand"><span><Sparkles size={21}/></span>Willingue<b>.</b></Link>
      <div className="guardian-top-actions">
        <span className="guardian-role-chip">Responsável</span>
        <Link href="/responsavel/notificacoes" className="guardian-notif" aria-label={`${unread} notificações não lidas`}>
          <Bell size={21}/>{unread > 0 && <i>{unread > 9 ? "9+" : unread}</i>}</Link>
      </div>
    </header>
    <main className="guardian-container">{children}</main>
    <GuardianNav/>
  </div>;
}
