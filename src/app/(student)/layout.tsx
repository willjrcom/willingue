import type { ReactNode } from "react";
import Link from "next/link";
import { Bell, Coins, Sparkles } from "lucide-react";
import { requireStudent } from "@/lib/auth";
import { db } from "@/lib/db";
import { StudentNav } from "@/components/student-nav";

export default async function StudentLayout({ children }: { children: ReactNode }) {
  const { user, student } = await requireStudent();
  const unread = await db.notification.count({ where: { userId: user.id, readAt: null } });
  return <div className="app-shell">
    <header className="topbar">
      <Link className="brand" href="/aprender" aria-label="Willingue, início"><span className="brand-mark"><Sparkles size={21}/></span><span>Willingue<span className="brand-period">.</span></span></Link>
      <div className="topbar-actions">
        <Link className="mini-balance" href="/recompensas" aria-label={`${student.coins} moedas`}><Coins size={19}/><strong>{student.coins}</strong></Link>
        <Link className="header-icon" href="/notificacoes" aria-label={unread ? `${unread} notificações não lidas` : "Notificações"}><Bell size={21}/>{unread > 0 && <span className="notif-dot">{unread > 9 ? "9+" : unread}</span>}</Link>
      </div>
    </header>
    <main className="page-container" id="content">{children}</main>
    <StudentNav/>
  </div>;
}
