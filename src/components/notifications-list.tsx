"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BellRing, CheckCheck } from "lucide-react";

type Item = { id: string; title: string; message: string; href: string; read: boolean; date: string };
export function NotificationsList({ items }: { items: Item[] }) {
  const router = useRouter();
  const [read, setRead] = useState<string[]>(items.filter(i => i.read).map(i => i.id));
  async function open(item: Item) {
    if (!read.includes(item.id)) {
      const response = await fetch(`/api/notifications/${item.id}/read`, { method: "POST" });
      if (response.ok) setRead(a=>[...a,item.id]);
    }
    const destination = item.href.startsWith("/") && !item.href.startsWith("//") ? item.href : "/learn";
    router.push(destination);router.refresh();
  }
  if (!items.length) return <div className="empty-card"><span>🔔</span><h3>Nenhuma novidade por enquanto</h3><p>Suas notificações aparecerão aqui.</p></div>;
  return <div className="notification-list">{items.map(item=><button type="button" key={item.id} className={`notification-item ${read.includes(item.id) ? "read" : "unread"}`} onClick={()=>void open(item)}><span className="notification-icon">{read.includes(item.id) ? <CheckCheck size={23}/> : <BellRing size={23}/>}</span><span><strong>{item.title}</strong><small>{item.message}</small><em>{item.date}</em></span>{!read.includes(item.id) && <i className="notification-unread-dot"/>}</button>)}</div>;
}
