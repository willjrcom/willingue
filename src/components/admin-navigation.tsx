"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, BookOpen, ChartNoAxesCombined, ChevronRight, CreditCard, Gift, GraduationCap, House, Menu, MessageSquareText, Settings, UsersRound, UserRoundCheck, X } from "lucide-react";
import { LogoutButton } from "@/components/logout-button";
import { BrandMark } from "@/components/brand-mark";

const groups = [
  { title: "PRINCIPAL", items: [
    { label: "Visão geral", path: "/admin", icon: House },
    { label: "Alunos", path: "/admin/students", icon: GraduationCap },
    { label: "Turmas", path: "/admin/classrooms", icon: UsersRound },
    { label: "Aprendizado", path: "/admin/learning", icon: BookOpen },
    { label: "Financeiro", path: "/admin/finance", icon: CreditCard },
  ] },
  { title: "GESTÃO", items: [
    { label: "Responsáveis", path: "/admin/guardians", icon: UserRoundCheck },
    { label: "Recompensas", path: "/admin/rewards", icon: Gift },
    { label: "Comunicados", path: "/admin/announcements", icon: MessageSquareText },
    { label: "Relatórios", path: "/admin/reports", icon: ChartNoAxesCombined },
  ] },
  { title: "SISTEMA", items: [
    { label: "Configurações", path: "/admin/settings", icon: Settings },
  ] },
];
const bottom = [groups[0].items[0], groups[0].items[1], groups[0].items[2], groups[0].items[4]];
export function AdminNavigation({ adminName, email }: { adminName: string; email: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (path: string) => path === "/admin" ? pathname === path : pathname.startsWith(path);
  const current = groups.flatMap(g => g.items).find(item => isActive(item.path));
  const mobileMore = !bottom.some(item => isActive(item.path));
  function itemLink(item: (typeof groups)[number]["items"][number]) {
    const Icon = item.icon;
    const active = isActive(item.path);
    return <Link key={item.path} href={item.path} className={`admin-side-link${active ? " active" : ""}`}
      onClick={() => setOpen(false)} aria-current={active ? "page" : undefined}>
      <Icon size={19} strokeWidth={active ? 2.6 : 2}/>
      <span>{item.label}</span>{active && <ChevronRight size={15} className="admin-link-chevron"/>}
    </Link>;
  }
  return <>
    <aside className="admin-sidebar">
      <Link href="/admin" className="admin-sidebar-logo"><span><BrandMark size={39}/></span>
        <strong>Willingue<span>.</span></strong><small>ADMIN</small></Link>
      <nav className="admin-side-groups" aria-label="Menu administrativo">
        {groups.map(group => <section key={group.title}>
          <p>{group.title}</p>{group.items.map(itemLink)}
        </section>)}
      </nav>
      <div className="admin-sidebar-footer">
        <span className="admin-sidebar-avatar">{adminName.slice(0,1).toUpperCase()}</span>
        <span><strong>{adminName}</strong><small>{email}</small></span>
      </div>
      <div className="admin-sidebar-logout"><LogoutButton/></div>
    </aside>
    <header className="admin-mobile-top">
      <Link href="/admin" className="admin-mobile-brand"><BrandMark size={32}/> Willingue<span>.</span></Link>
      <div><span className="admin-mobile-role">Administrador</span>
        <Link href="/admin/announcements" aria-label="Comunicados"><Bell size={21}/></Link>
        <button type="button" aria-label="Abrir menu" onClick={()=>setOpen(true)}><Menu size={22}/></button>
      </div>
    </header>
    <nav className="admin-mobile-nav" aria-label="Menu principal">
      {bottom.map(item => {const Icon=item.icon;const active=isActive(item.path);return <Link key={item.path} href={item.path}
        className={active?"active":""} aria-current={active?"page":undefined}>
        <Icon size={21}/><span>{item.label === "Visão geral"?"Início":item.label}</span></Link>})}
      <button type="button" onClick={()=>setOpen(true)} className={mobileMore?"active":""} aria-label="Mais opções">
        <Menu size={21}/><span>Mais</span></button>
    </nav>
    {open && <div className="admin-mobile-overlay" onMouseDown={e=>{if(e.target===e.currentTarget)setOpen(false);}}>
      <div className="admin-mobile-drawer" role="dialog" aria-modal="true" aria-label="Menu da administração">
        <div className="admin-drawer-title"><strong>Navegação</strong>
          <button type="button" aria-label="Fechar menu" onClick={()=>setOpen(false)}><X size={23}/></button></div>
        <div className="admin-drawer-current"><span>{adminName.slice(0,1).toUpperCase()}</span>
          <div><strong>{adminName}</strong><small>{email}</small></div></div>
        <nav aria-label="Todas as áreas">
          {groups.map(group => <section key={group.title}><p>{group.title}</p>{group.items.map(itemLink)}</section>)}
        </nav>
        <LogoutButton/>
      </div>
    </div>}
  </>;
}
